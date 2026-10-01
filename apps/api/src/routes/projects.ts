import { floorModelSchema, type Project } from '@capstone/shared'
import { desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { imageSize } from 'image-size'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { editFloorModel } from '../agents/editor'
import { defaultModel, type ImageInput } from '../agents/llm'
import { isAllowedModel } from '../agents/models'
import { parseFloorPlan } from '../agents/parser'
import { db } from '../db'
import { projects, type ProjectRow } from '../db/schema'
import { sampleFloorModel } from '../sample'
import { buildLegendPlate, buildMapPlate } from '../tactile/convert'
import { toBinaryStl } from '../tactile/geometry'

const UPLOADS_DIR = process.env.UPLOADS_DIR ?? 'data/uploads'
mkdirSync(UPLOADS_DIR, { recursive: true })

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export const projectRoutes = new Hono()

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    error: row.error,
    hasImage: row.imagePath !== null,
    aiModel: row.aiModel,
    model: row.model ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

async function findRow(id: string) {
  const [row] = await db.select().from(projects).where(eq(projects.id, id))
  return row
}

async function loadImage(row: ProjectRow): Promise<ImageInput | undefined> {
  if (!row.imagePath || !row.imageType) return undefined
  return { data: await Bun.file(row.imagePath).bytes(), mimeType: row.imageType }
}

// The parser agent can take a minute or more, so it runs in the background
// and the webpage polls GET /projects/:id until status is ready or failed.
// The model a project uses: the one chosen at upload, if still allowed.
function modelFor(row: ProjectRow): string {
  return row.aiModel && isAllowedModel(row.aiModel) ? row.aiModel : defaultModel
}

async function runParse(row: ProjectRow) {
  const aiModel = modelFor(row)
  await db.update(projects).set({ status: 'parsing', error: null }).where(eq(projects.id, row.id))
  try {
    const image = await loadImage(row)
    if (!image) throw new Error('Dự án này không có ảnh để đọc')
    const { width, height } = imageSize(image.data)
    console.log(`[parse] ${row.name}: reading ${width}x${height} image with ${aiModel}`)
    const started = Date.now()
    const model = await parseFloorPlan(image, width, height, aiModel)
    console.log(
      `[parse] ${row.name}: done in ${Math.round((Date.now() - started) / 1000)}s ` +
        `(${model.walls.length} walls, ${model.doors.length} doors, ${model.rooms.length} rooms, ${model.features.length} symbols)`,
    )
    await db.update(projects).set({ status: 'ready', model, aiModel }).where(eq(projects.id, row.id))
  } catch (error) {
    console.error(`[parse] ${row.id} failed:`, error)
    const message = error instanceof Error ? error.message : String(error)
    await db.update(projects).set({ status: 'failed', error: message }).where(eq(projects.id, row.id))
  }
}

projectRoutes.get('/', async (c) => {
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt))
  return c.json(rows.map(toProject))
})

// Upload a floor-plan image (multipart form: "file", optional "name").
projectRoutes.post('/', async (c) => {
  const form = await c.req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return c.json({ error: 'Hãy chọn một tệp ảnh' }, 400)
  if (!IMAGE_TYPES.includes(file.type)) return c.json({ error: 'Hãy dùng ảnh PNG, JPG hoặc WebP' }, 400)
  if (file.size > MAX_UPLOAD_BYTES) return c.json({ error: 'Ảnh phải có dung lượng tối đa 10 MB' }, 400)
  const aiModel = String(form.get('model') ?? '').trim() || defaultModel
  if (!isAllowedModel(aiModel)) return c.json({ error: `Mô hình không được phép: ${aiModel}` }, 400)

  const id = crypto.randomUUID()
  const imagePath = join(UPLOADS_DIR, `${id}.${file.type.split('/')[1]}`)
  await Bun.write(imagePath, file)

  const name = String(form.get('name') ?? '').trim() || file.name
  const [row] = await db
    .insert(projects)
    .values({ id, name, status: 'uploaded', imagePath, imageType: file.type, aiModel })
    .returning()
  void runParse(row!)
  return c.json(toProject(row!), 201)
})

// Create a project from the built-in sample (no AI key needed).
projectRoutes.post('/sample', async (c) => {
  const [row] = await db
    .insert(projects)
    .values({ id: crypto.randomUUID(), name: 'Văn phòng mẫu', status: 'ready', model: sampleFloorModel })
    .returning()
  return c.json(toProject(row!), 201)
})

projectRoutes.get('/:id', async (c) => {
  const row = await findRow(c.req.param('id'))
  return row ? c.json(toProject(row)) : c.json({ error: 'Không tìm thấy' }, 404)
})

projectRoutes.delete('/:id', async (c) => {
  const row = await findRow(c.req.param('id'))
  if (!row) return c.json({ error: 'Không tìm thấy' }, 404)
  if (row.imagePath) await Bun.file(row.imagePath).delete().catch(() => {})
  await db.delete(projects).where(eq(projects.id, row.id))
  return c.body(null, 204)
})

projectRoutes.get('/:id/image', async (c) => {
  const row = await findRow(c.req.param('id'))
  if (!row?.imagePath) return c.json({ error: 'Không tìm thấy' }, 404)
  return new Response(Bun.file(row.imagePath))
})

// Run the parser agent again (e.g. after a failure).
projectRoutes.post('/:id/parse', async (c) => {
  const row = await findRow(c.req.param('id'))
  if (!row) return c.json({ error: 'Không tìm thấy' }, 404)
  if (row.status === 'parsing') return c.json({ error: 'Đang đọc sơ đồ' }, 409)
  void runParse(row)
  return c.json({ ...toProject(row), status: 'parsing' }, 202)
})

// Save the model after manual edits in the editor.
projectRoutes.put('/:id/model', async (c) => {
  const row = await findRow(c.req.param('id'))
  if (!row) return c.json({ error: 'Không tìm thấy' }, 404)
  const parsed = floorModelSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: parsed.error.issues }, 400)

  const [updated] = await db
    .update(projects)
    .set({ model: parsed.data, status: 'ready' })
    .where(eq(projects.id, row.id))
    .returning()
  return c.json(toProject(updated!))
})

// Ask the edit agent to change the model in plain English.
projectRoutes.post('/:id/edit', async (c) => {
  const row = await findRow(c.req.param('id'))
  if (!row?.model) return c.json({ error: 'Không tìm thấy' }, 404)
  const body = (await c.req.json().catch(() => ({}))) as { instruction?: unknown }
  const instruction = typeof body.instruction === 'string' ? body.instruction.trim() : ''
  if (!instruction) return c.json({ error: 'Hãy nhập yêu cầu chỉnh sửa' }, 400)

  try {
    const aiModel = modelFor(row)
    const model = await editFloorModel(row.model, instruction, aiModel, await loadImage(row))
    const [updated] = await db.update(projects).set({ model, aiModel }).where(eq(projects.id, row.id)).returning()
    return c.json(toProject(updated!))
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : String(error) }, 502)
  }
})

// Legend and warnings for the tactile plate.
projectRoutes.get('/:id/tactile', async (c) => {
  const row = await findRow(c.req.param('id'))
  if (!row?.model) return c.json({ error: 'Không tìm thấy' }, 404)
  return c.json(buildMapPlate(row.model).summary)
})

// The printable files. Add ?download=1 to save instead of display.
projectRoutes.get('/:id/map.stl', async (c) => {
  const row = await findRow(c.req.param('id'))
  if (!row?.model) return c.json({ error: 'Không tìm thấy' }, 404)
  return stlResponse(toBinaryStl(buildMapPlate(row.model).triangles), `${row.name}-map.stl`, c.req.query('download'))
})

projectRoutes.get('/:id/legend.stl', async (c) => {
  const row = await findRow(c.req.param('id'))
  if (!row?.model) return c.json({ error: 'Không tìm thấy' }, 404)
  const { legend } = buildMapPlate(row.model).summary
  return stlResponse(toBinaryStl(buildLegendPlate(legend)), `${row.name}-legend.stl`, c.req.query('download'))
})

function stlResponse(stl: Uint8Array, filename: string, download: string | undefined) {
  const safeName = filename.replace(/[^\w.-]+/g, '-')
  return new Response(stl, {
    headers: {
      'Content-Type': 'model/stl',
      ...(download ? { 'Content-Disposition': `attachment; filename="${safeName}"` } : {}),
    },
  })
}
