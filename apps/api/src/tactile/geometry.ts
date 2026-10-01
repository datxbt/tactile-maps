// Minimal 3D geometry: raised shapes as triangles, written out as a binary
// STL. Units are millimetres, z points up. Overlapping solids are fine:
// slicers (Cura, PrusaSlicer, Bambu Studio) merge them when printing.

export type Vec3 = [number, number, number]
export type Triangle = [Vec3, Vec3, Vec3]
export type Point2 = { x: number; y: number }

// A flat convex shape (outline in x/y) extruded from z0 up to z1.
export function prism(outline: Point2[], z0: number, z1: number): Triangle[] {
  // Make the outline counter-clockwise so every face points outward.
  const signedArea = outline.reduce((sum, p, i) => {
    const q = outline[(i + 1) % outline.length]!
    return sum + (p.x * q.y - q.x * p.y)
  }, 0)
  const points = signedArea < 0 ? [...outline].reverse() : outline
  const bottom = (p: Point2): Vec3 => [p.x, p.y, z0]
  const top = (p: Point2): Vec3 => [p.x, p.y, z1]

  const triangles: Triangle[] = []
  for (let i = 1; i < points.length - 1; i++) {
    const [a, b, c] = [points[0]!, points[i]!, points[i + 1]!]
    triangles.push([top(a), top(b), top(c)])
    triangles.push([bottom(a), bottom(c), bottom(b)])
  }
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length]!
    triangles.push([bottom(p), bottom(q), top(q)])
    triangles.push([bottom(p), top(q), top(p)])
  })
  return triangles
}

export function box(x0: number, y0: number, x1: number, y1: number, z0: number, z1: number) {
  return prism(
    [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }],
    z0,
    z1,
  )
}

// A raised bar of the given width from p to q (a wall, a stair rung...).
// Ends are extended by half the width so bars meet cleanly at corners.
export function bar(p: Point2, q: Point2, width: number, z0: number, z1: number) {
  const length = Math.hypot(q.x - p.x, q.y - p.y)
  if (length === 0) return []
  const h = width / 2
  const d = { x: ((q.x - p.x) / length) * h, y: ((q.y - p.y) / length) * h }
  const n = { x: -d.y, y: d.x }
  return prism(
    [
      { x: p.x - d.x + n.x, y: p.y - d.y + n.y },
      { x: q.x + d.x + n.x, y: q.y + d.y + n.y },
      { x: q.x + d.x - n.x, y: q.y + d.y - n.y },
      { x: p.x - d.x - n.x, y: p.y - d.y - n.y },
    ],
    z0,
    z1,
  )
}

export function circle(center: Point2, radius: number, segments = 16): Point2[] {
  return Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * Math.PI * 2
    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) }
  })
}

// A flat ring (annulus), built from small quads so each piece is convex.
export function ring(center: Point2, outer: number, inner: number, z0: number, z1: number) {
  const outside = circle(center, outer)
  const inside = circle(center, inner)
  return outside.flatMap((_, i) => {
    const j = (i + 1) % outside.length
    return prism([outside[i]!, outside[j]!, inside[j]!, inside[i]!], z0, z1)
  })
}

// A rounded braille dot: a spherical cap with the given base radius and height.
export function dome(center: Point2, baseRadius: number, height: number, z0: number) {
  const sphereRadius = (baseRadius ** 2 + height ** 2) / (2 * height)
  const maxAngle = Math.asin(baseRadius / sphereRadius)
  const sphereZ = z0 + height - sphereRadius
  const rings = 4
  const segments = 12

  const vertex = (ringIndex: number, segment: number): Vec3 => {
    const polar = (maxAngle * ringIndex) / rings
    const around = (segment / segments) * Math.PI * 2
    const r = sphereRadius * Math.sin(polar)
    return [center.x + r * Math.cos(around), center.y + r * Math.sin(around), sphereZ + sphereRadius * Math.cos(polar)]
  }

  const triangles: Triangle[] = []
  for (let k = 0; k < rings; k++) {
    for (let s = 0; s < segments; s++) {
      const upper = vertex(k, s)
      const upperNext = vertex(k, s + 1)
      const lower = vertex(k + 1, s)
      const lowerNext = vertex(k + 1, s + 1)
      triangles.push([upper, lower, lowerNext])
      if (k > 0) triangles.push([upper, lowerNext, upperNext])
    }
  }
  const middle: Vec3 = [center.x, center.y, z0]
  for (let s = 0; s < segments; s++) {
    triangles.push([middle, vertex(rings, s + 1), vertex(rings, s)])
  }
  return triangles
}

// Binary STL: 80-byte header, triangle count, then 50 bytes per triangle.
export function toBinaryStl(triangles: Triangle[]): Uint8Array {
  const buffer = new ArrayBuffer(84 + triangles.length * 50)
  const view = new DataView(buffer)
  view.setUint32(80, triangles.length, true)
  let offset = 84
  for (const [a, b, c] of triangles) {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]] as const
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]] as const
    const normal = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]
    const length = Math.hypot(...normal) || 1
    const values = [...normal.map((x) => x / length), ...a, ...b, ...c]
    values.forEach((value, i) => view.setFloat32(offset + i * 4, value, true))
    offset += 50
  }
  return new Uint8Array(buffer)
}
