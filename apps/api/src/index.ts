import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { db } from './db'
import './db/migrate'
import { projects } from './db/schema'
import { defaultModel, provider } from './agents/llm'
import { modelOptions } from './agents/models'
import { projectRoutes } from './routes/projects'

// A parse that was running when the server stopped will never finish:
// mark it failed so the user can retry.
await db
  .update(projects)
  .set({ status: 'failed', error: 'Bị gián đoạn do máy chủ khởi động lại. Hãy thử lại.' })
  .where(eq(projects.status, 'parsing'))

const app = new Hono()

app.use('*', cors())
// Print every request and its response time in the terminal.
app.use('*', logger())

// Health check; also shows which AI model the running server is using.
app.get('/', (c) => c.json({ ok: true, provider, defaultModel }))

// The models the upload form may offer.
app.get('/models', (c) => c.json(modelOptions()))

app.route('/projects', projectRoutes)

// Hosts such as Render provide PORT; local dev overrides via --port in the dev script.
export default {
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 3003),
  // The edit agent answers within the request, which can take a while.
  idleTimeout: 255,
}
