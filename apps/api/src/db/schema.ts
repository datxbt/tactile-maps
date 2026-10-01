import type { FloorModel, ProjectStatus } from '@capstone/shared'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// One row per uploaded floor plan. The FloorModel is stored as JSON.
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').$type<ProjectStatus>().notNull(),
  error: text('error'),
  // Path of the uploaded image on disk; null for the built-in sample.
  imagePath: text('image_path'),
  imageType: text('image_type'),
  model: text('model', { mode: 'json' }).$type<FloorModel>(),
  // Which AI model last read or edited the plan; null for the sample.
  aiModel: text('ai_model'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type ProjectRow = typeof projects.$inferSelect
