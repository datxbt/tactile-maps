import { z } from 'zod'

// The FloorModel is "what is in the building", in plan-image pixels
// (origin top-left, y down). The AI fills it in, the user corrects it,
// and the API converts it into a printable tactile plate.

export const pointSchema = z.object({ x: z.number(), y: z.number() })

// 0..1: how sure the AI was. Below REVIEW_THRESHOLD the editor flags it.
const confidenceSchema = z.number().min(0).max(1)
export const REVIEW_THRESHOLD = 0.7

export const wallSchema = z.object({
  id: z.string().min(1),
  a: pointSchema,
  b: pointSchema,
  confidence: confidenceSchema,
})

// A door is a gap cut into whichever wall it sits on.
export const doorSchema = z.object({
  id: z.string().min(1),
  at: pointSchema,
  width: z.number().positive(),
  confidence: confidenceSchema,
})

export const roomSchema = z.object({
  id: z.string().min(1),
  polygon: z.array(pointSchema).min(3),
  label: z.string().max(100).nullable(),
  confidence: confidenceSchema,
})

export const featureKinds = ['stairs', 'elevator', 'entrance', 'restroom'] as const

export const featureSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(featureKinds),
  at: pointSchema,
  confidence: confidenceSchema,
})

export const floorModelSchema = z.object({
  title: z.string().max(100).nullable(),
  widthPx: z.number().positive(),
  heightPx: z.number().positive(),
  walls: z.array(wallSchema),
  doors: z.array(doorSchema),
  rooms: z.array(roomSchema),
  features: z.array(featureSchema),
})

export type Point = z.infer<typeof pointSchema>
export type Wall = z.infer<typeof wallSchema>
export type Door = z.infer<typeof doorSchema>
export type Room = z.infer<typeof roomSchema>
export type FeatureKind = (typeof featureKinds)[number]
export type Feature = z.infer<typeof featureSchema>
export type FloorModel = z.infer<typeof floorModelSchema>
