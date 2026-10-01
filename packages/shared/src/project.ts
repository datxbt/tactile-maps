import type { FloorModel } from './floor-model'

// uploaded -> parsing -> ready (or failed). A sample project starts at ready.
export type ProjectStatus = 'uploaded' | 'parsing' | 'ready' | 'failed'

export type Project = {
  id: string
  name: string
  status: ProjectStatus
  error: string | null
  hasImage: boolean
  // The AI model that last read or edited this plan (null for the sample).
  aiModel: string | null
  model: FloorModel | null
  createdAt: string
}

export type LegendEntry = { key: string; text: string }

// One entry in the model dropdown. approxCents is a rough cost per plan.
export type ModelChoice = { id: string; label: string; approxCents: number | null }

export type ModelOptions = { defaultModel: string; choices: ModelChoice[] }

// Summary of the generated plate, shown next to the 3D preview.
export type TactileSummary = {
  legend: LegendEntry[]
  warnings: string[]
  mmPerPx: number
}
