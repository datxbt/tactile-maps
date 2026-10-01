import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import * as schema from './schema'

const databasePath = process.env.DATABASE_PATH ?? 'data/app.db'
mkdirSync(dirname(databasePath), { recursive: true })

const sqlite = new Database(databasePath, { create: true })
sqlite.exec('PRAGMA journal_mode = WAL;')

export const db = drizzle(sqlite, { schema })
