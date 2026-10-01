import type {
  Door,
  FeatureKind,
  FloorModel,
  LegendEntry,
  Point,
  Room,
  TactileSummary,
  Wall,
} from '@capstone/shared'
import { BRAILLE_MM, brailleDots, brailleSize, textToCells } from './braille'
import { bar, box, circle, dome, prism, ring, type Point2, type Triangle } from './geometry'

// FloorModel (plan pixels) -> printable tactile plate (millimetres).
// This is plain deterministic code, no AI: the standards live here as
// fixed numbers (BANA 2022 tactile graphics guidelines, ADA §703).

export const PLATE = { width: 200, height: 200, base: 3, margin: 10 }
const WALL = { width: 2, height: 1.0 }
const SYMBOL = { size: 6, height: 1.5 }
const MIN_DOOR_GAP_MM = 5
const MIN_SYMBOL_SPACING_MM = 9 // symbol size + 3 mm clear space

type PlateResult = { triangles: Triangle[]; summary: TactileSummary }

export function buildMapPlate(model: FloorModel): PlateResult {
  const warnings: string[] = []

  // 1. Scale the plan to fit inside the plate margins, centred.
  const usable = PLATE.width - 2 * PLATE.margin
  const mmPerPx = Math.min(usable / model.widthPx, usable / model.heightPx)
  const offsetX = (PLATE.width - model.widthPx * mmPerPx) / 2
  const offsetY = (PLATE.height - model.heightPx * mmPerPx) / 2
  // Plan y points down; STL y points up, so flip it here once.
  const toPlate = (p: Point): Point2 => ({
    x: offsetX + p.x * mmPerPx,
    y: PLATE.height - (offsetY + p.y * mmPerPx),
  })
  const top = PLATE.base

  const triangles: Triangle[] = box(0, 0, PLATE.width, PLATE.height, 0, PLATE.base)

  // 2. Walls become raised lines, with a gap cut wherever a door sits.
  const gaps = doorGapsByWall(model.walls, model.doors, warnings)
  for (const wall of model.walls) {
    for (const [from, to] of wallPieces(wall, gaps.get(wall.id) ?? [])) {
      triangles.push(...bar(toPlate(from), toPlate(to), WALL.width, top, top + WALL.height))
    }
  }
  for (const door of model.doors) {
    const gapMm = door.width * mmPerPx
    if (gapMm < MIN_DOOR_GAP_MM) {
      warnings.push(
        `Cửa ${door.id} chỉ rộng ${gapMm.toFixed(1)} mm trên tấm (cần ${MIN_DOOR_GAP_MM} mm). Sơ đồ có thể quá lớn cho một tấm.`,
      )
    }
  }

  // 3. Features become standard tactile symbols.
  for (const feature of model.features) {
    triangles.push(...symbol(feature.kind, toPlate(feature.at), top))
  }
  model.features.forEach((a, i) =>
    model.features.slice(i + 1).forEach((b) => {
      const distance = Math.hypot(a.at.x - b.at.x, a.at.y - b.at.y) * mmPerPx
      if (distance < MIN_SYMBOL_SPACING_MM) {
        warnings.push(`Ký hiệu ${a.id} và ${b.id} cách nhau ${distance.toFixed(1)} mm (cần ${MIN_SYMBOL_SPACING_MM} mm).`)
      }
    }),
  )

  // 4. Labelled rooms get a short braille key; the legend spells it out.
  const legend = assignKeys(model.rooms)
  for (const room of model.rooms) {
    const entry = legend.find((item) => item.roomId === room.id)
    if (!entry) continue
    const size = brailleSize(entry.key)
    const center = centroid(room.polygon)
    const roomWidthMm = (Math.max(...room.polygon.map((p) => p.x)) - Math.min(...room.polygon.map((p) => p.x))) * mmPerPx
    if (size.width + 4 > roomWidthMm) {
      warnings.push(`Phòng "${room.label}" quá nhỏ trên tấm để đặt mã chữ nổi "${entry.key}".`)
    }
    const origin = {
      x: offsetX + center.x * mmPerPx - size.width / 2,
      y: offsetY + center.y * mmPerPx - size.height / 2,
    }
    for (const dot of brailleDots(entry.key, origin)) {
      triangles.push(...dome({ x: dot.x, y: PLATE.height - dot.y }, BRAILLE_MM.dotBaseRadius, BRAILLE_MM.dotHeight, top))
    }
  }

  // 5. Orientation mark: a small triangle in the top-left corner shows
  //    the reader which way up the plate goes.
  triangles.push(
    ...prism(
      [
        { x: 3, y: PLATE.height - 3 },
        { x: 8, y: PLATE.height - 3 },
        { x: 3, y: PLATE.height - 8 },
      ],
      top,
      top + SYMBOL.height,
    ),
  )

  return {
    triangles,
    summary: {
      legend: legend.map(({ key, text }) => ({ key, text })),
      warnings,
      mmPerPx,
    },
  }
}

// A second plate listing each braille key and the room name it stands for.
export function buildLegendPlate(legend: LegendEntry[]): Triangle[] {
  const maxCells = Math.floor((PLATE.width - 2 * PLATE.margin) / BRAILLE_MM.cellPitch)
  const height = Math.max(30, 2 * PLATE.margin + (legend.length - 1) * BRAILLE_MM.linePitch + 2 * BRAILLE_MM.dotPitchY)
  const triangles = box(0, 0, PLATE.width, height, 0, PLATE.base)

  legend.forEach((entry, row) => {
    let text = `${entry.key} ${entry.text}`
    while (textToCells(text).length > maxCells) text = text.slice(0, -1)
    const origin = { x: PLATE.margin, y: PLATE.margin + row * BRAILLE_MM.linePitch }
    for (const dot of brailleDots(text, origin)) {
      triangles.push(...dome({ x: dot.x, y: height - dot.y }, BRAILLE_MM.dotBaseRadius, BRAILLE_MM.dotHeight, PLATE.base))
    }
  })
  return triangles
}

// Standard symbols (see capstone-core/STANDARDS.md in bumps-main), 6 mm wide.
function symbol(kind: FeatureKind, at: Point2, z0: number): Triangle[] {
  const z1 = z0 + SYMBOL.height
  const half = SYMBOL.size / 2
  switch (kind) {
    case 'stairs': // three equal rungs
      return [-2.4, 0, 2.4].flatMap((dy) =>
        bar({ x: at.x - half, y: at.y + dy }, { x: at.x + half, y: at.y + dy }, 1.2, z0, z1),
      )
    case 'elevator': // square outline with a centre dot
      return [
        ...box(at.x - half, at.y - half, at.x + half, at.y - half + 1, z0, z1),
        ...box(at.x - half, at.y + half - 1, at.x + half, at.y + half, z0, z1),
        ...box(at.x - half, at.y - half, at.x - half + 1, at.y + half, z0, z1),
        ...box(at.x + half - 1, at.y - half, at.x + half, at.y + half, z0, z1),
        ...prism(circle(at, 0.9), z0, z1),
      ]
    case 'entrance': // filled triangle
      return prism(
        [
          { x: at.x, y: at.y + half },
          { x: at.x - half, y: at.y - half },
          { x: at.x + half, y: at.y - half },
        ],
        z0,
        z1,
      )
    case 'restroom': // circle with a centre dot
      return [...ring(at, half, half - 1, z0, z1), ...prism(circle(at, 0.8), z0, z1)]
  }
}

// Match each door to the nearest wall it sits on, as a range along the wall.
function doorGapsByWall(walls: Wall[], doors: Door[], warnings: string[]) {
  const gaps = new Map<string, [number, number][]>()
  for (const door of doors) {
    let best: { wall: Wall; along: number; distance: number } | null = null
    for (const wall of walls) {
      const { along, distance } = projectOnto(door.at, wall)
      if (!best || distance < best.distance) best = { wall, along, distance }
    }
    if (!best || best.distance > Math.max(door.width / 2, 10)) {
      warnings.push(`Cửa ${door.id} không nằm trên bức tường nào nên không cắt khe hở cho nó.`)
      continue
    }
    const list = gaps.get(best.wall.id) ?? []
    list.push([best.along - door.width / 2, best.along + door.width / 2])
    gaps.set(best.wall.id, list)
  }
  return gaps
}

function projectOnto(p: Point, wall: Wall) {
  const dx = wall.b.x - wall.a.x
  const dy = wall.b.y - wall.a.y
  const length = Math.hypot(dx, dy)
  const along = Math.max(0, Math.min(length, ((p.x - wall.a.x) * dx + (p.y - wall.a.y) * dy) / length))
  const closest = { x: wall.a.x + (dx / length) * along, y: wall.a.y + (dy / length) * along }
  return { along, distance: Math.hypot(p.x - closest.x, p.y - closest.y) }
}

// The solid pieces of a wall once its door gaps are removed.
function wallPieces(wall: Wall, gaps: [number, number][]): [Point, Point][] {
  const length = Math.hypot(wall.b.x - wall.a.x, wall.b.y - wall.a.y)
  const at = (distance: number): Point => ({
    x: wall.a.x + ((wall.b.x - wall.a.x) * distance) / length,
    y: wall.a.y + ((wall.b.y - wall.a.y) * distance) / length,
  })
  const pieces: [Point, Point][] = []
  let start = 0
  for (const [gapStart, gapEnd] of [...gaps].sort((a, b) => a[0] - b[0])) {
    if (gapStart > start) pieces.push([at(start), at(gapStart)])
    start = Math.max(start, gapEnd)
  }
  if (start < length) pieces.push([at(start), at(length)])
  return pieces.filter(([a, b]) => Math.hypot(a.x - b.x, a.y - b.y) > 1)
}

// 1-2 letter keys: "Lobby" -> "lo", "Lab" -> "la"; unique across rooms.
function assignKeys(rooms: Room[]) {
  const used = new Set<string>()
  const entries: (LegendEntry & { roomId: string })[] = []
  for (const room of rooms) {
    const letters = (room.label ?? '').toLowerCase().replace(/[^a-z]/g, '')
    if (!letters) continue
    const candidates = [
      ...letters.slice(1).split('').map((second) => letters[0] + second),
      ...'abcdefghijklmnopqrstuvwxyz'.split('').map((second) => letters[0] + second),
      ...'abcdefghijklmnopqrstuvwxyz'.split('').flatMap((a) => 'abcdefghijklmnopqrstuvwxyz'.split('').map((b) => a + b)),
    ]
    const key = candidates.find((candidate) => !used.has(candidate))!
    used.add(key)
    const text = room.label!.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    entries.push({ key, text: text || key, roomId: room.id })
  }
  return entries
}

function centroid(polygon: Point[]): Point {
  let area = 0
  let x = 0
  let y = 0
  polygon.forEach((p, i) => {
    const q = polygon[(i + 1) % polygon.length]!
    const cross = p.x * q.y - q.x * p.y
    area += cross
    x += (p.x + q.x) * cross
    y += (p.y + q.y) * cross
  })
  if (Math.abs(area) < 1e-6) {
    return {
      x: polygon.reduce((sum, p) => sum + p.x, 0) / polygon.length,
      y: polygon.reduce((sum, p) => sum + p.y, 0) / polygon.length,
    }
  }
  return { x: x / (3 * area), y: y / (3 * area) }
}
