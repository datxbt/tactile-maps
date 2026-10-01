import { featureKinds, type FloorModel, type Point } from '@capstone/shared'
import { z } from 'zod'

// Models are inconsistent, so accept their output leniently ([x, y] or
// {x, y} points, missing fields, junk entries) and turn it into a clean
// FloorModel with fresh unique ids. Invalid entries are dropped, not fatal.

const point = z.union([
  z.tuple([z.number(), z.number()]).transform(([x, y]) => ({ x, y })),
  z.object({ x: z.number(), y: z.number() }),
])
const confidence = z.number().min(0).max(1).catch(0.5)

function lenientArray<T extends z.ZodType>(item: T) {
  return z
    .array(z.unknown())
    .catch([])
    .transform((entries) =>
      entries.flatMap((entry) => {
        const parsed = item.safeParse(entry)
        return parsed.success ? [parsed.data as z.infer<T>] : []
      }),
    )
}

const modelOutput = z.object({
  suitability: z.string().optional(),
  title: z.string().nullable().catch(null).optional(),
  walls: lenientArray(z.object({ a: point, b: point, confidence })),
  doors: lenientArray(z.object({ at: point, width: z.number().positive(), confidence })),
  rooms: lenientArray(
    z.object({
      polygon: z.array(point).min(3),
      label: z.string().nullable().catch(null).optional(),
      confidence,
    }),
  ),
  features: lenientArray(z.object({ kind: z.enum(featureKinds), at: point, confidence })),
})

export function normalizeModel(raw: unknown, widthPx: number, heightPx: number): FloorModel {
  const output = modelOutput.parse(raw)
  if (output.suitability === 'poor') {
    throw new Error('Ảnh này không giống một sơ đồ mặt bằng 2D rõ ràng nhìn từ trên xuống')
  }

  const clamp = (p: Point): Point => ({
    x: Math.min(Math.max(p.x, 0), widthPx),
    y: Math.min(Math.max(p.y, 0), heightPx),
  })

  return {
    title: output.title?.trim() || null,
    widthPx,
    heightPx,
    walls: output.walls
      .map((wall, i) => ({
        id: `w-${i + 1}`,
        a: clamp(wall.a),
        b: clamp(wall.b),
        confidence: wall.confidence,
      }))
      .filter((wall) => wall.a.x !== wall.b.x || wall.a.y !== wall.b.y),
    doors: output.doors.map((door, i) => ({
      id: `d-${i + 1}`,
      at: clamp(door.at),
      width: door.width,
      confidence: door.confidence,
    })),
    rooms: output.rooms.map((room, i) => ({
      id: `r-${i + 1}`,
      polygon: room.polygon.map(clamp),
      label: room.label?.trim() || null,
      confidence: room.confidence,
    })),
    features: output.features.map((feature, i) => ({
      id: `f-${i + 1}`,
      kind: feature.kind,
      at: clamp(feature.at),
      confidence: feature.confidence,
    })),
  }
}
