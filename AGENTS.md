# Repository conventions

- This is a university capstone project: a simplified version of the `bumps` tactile-map app. Read `README.md` for how the pieces fit together and `docs/idea.md` for the product brief before medium or large changes.
- Keep it simple. Prefer a small amount of clear code over abstractions; this codebase is also a learning resource.
- The FloorModel in `packages/shared/src/floor-model.ts` is the one format shared by the webpage, the backend and the AI agents. Change it there first.
- AI proposes, deterministic code disposes: agents (`apps/api/src/agents`) only read or edit the FloorModel. Tactile standards live as fixed constants in `apps/api/src/tactile`.
- Data lives in SQLite (`bun:sqlite`) through Drizzle (`apps/api/src/db`). Change `schema.ts`, then run `bun run db:generate` in `apps/api`; the API applies migrations on start.
- Run `bun run setup` when initializing a fresh copy.
