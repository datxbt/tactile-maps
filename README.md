# Tactile maps (capstone)

Upload a floor plan image and get a 3D-printable **tactile map**: raised walls, standard symbols and braille that a blind or low-vision person can read with their fingers before visiting a building.

This is a simplified version of the `bumps` hackathon project. It keeps the same flow (upload, AI agents, editing, 3D view, STL export) with far less code.

## Run it

Requires [Bun](https://bun.sh) 1.3+.

```bash
bun run setup   # installs everything and creates the .env files
bun run dev     # starts the webpage and the backend
```

Open http://localhost:3000 and click **Bắt đầu tạo bản đồ** (or go to http://localhost:3000/maps). Click **Dùng thử văn phòng mẫu** to see the whole flow without an AI key.

To read your own floor plans, add an AI key to `apps/api/.env` and restart `bun run dev`:

- **Gemini (default):** create a key at https://aistudio.google.com and set `GEMINI_API_KEY=...`
- **or OpenRouter:** set `MODEL_PROVIDER=openrouter` and `OPENROUTER_API_KEY=...`

With OpenRouter, the upload form has an **AI model** dropdown with a rough price per run. The allowed models live in `apps/api/src/agents/models.ts`; the backend rejects anything else, so nobody can pick an expensive model by editing the page. `MODEL=` in `.env` sets which one is preselected. AI edits reuse the model the plan was read with.

The backend reads `.env` only when it starts, so **restart `bun run dev` after every `.env` change**. To check which model the running backend uses, open http://localhost:3003/.

## How it works

```
 image ──► 1. PARSER AGENT ──► FloorModel (JSON) ──► 2. YOU EDIT ──► 3. CONVERT ──► STL file ──► 3D printer
            (AI, one call)      walls, doors,          (+ edit agent)    (plain code,
                                rooms, symbols                           no AI)
```

1. **Upload.** The webpage sends the image to the backend, which saves it and starts the **parser agent** in the background. The page checks back every 2 seconds until it's done.
2. **Parser agent.** One call to a multimodal AI model with a detailed prompt. The model returns JSON listing the walls, doors, rooms and symbols it sees, each with a *confidence* score. The backend cleans that JSON up into a **FloorModel**.
3. **Review and edit.** The editor draws the FloorModel over your image. Anything with confidence below 70% is shown in amber, meaning *check this*. You can drag points, add walls, doors and symbols, rename rooms, and delete mistakes. You can also type an instruction for the **edit agent** (for example *"add a door between the lobby and the corridor"*).
4. **Convert.** Plain code with no AI turns the FloorModel into a 200 × 200 mm plate using fixed tactile standards: walls +1.0 mm, symbols +1.5 mm, braille dots +0.7 mm, doors as gaps of at least 5 mm, and a short braille key in each room. It also lists warnings when a rule is broken.
5. **3D preview and export.** The page shows the exact STL file in 3D. You download two files: the **map** plate and a **legend** plate that spells out each braille key.

The key design idea: **the AI only reads the drawing; the rules that make the map readable are fixed code.** A model can't silently produce an unreadable map, and every part can be tested on its own.

## Where things are

```
packages/shared/src/
  floor-model.ts        the FloorModel: the one data format everything shares
  project.ts            Project type (a saved upload) and the tactile summary

apps/api/src/                     BACKEND (Bun + Hono, port 3003)
  index.ts                        starts the server
  routes/projects.ts              every API endpoint (table below)
  agents/llm.ts                   calls Gemini or OpenRouter
  agents/models.ts                the models the upload dropdown may offer, with prices
  agents/parser.ts                parser agent: image -> FloorModel (the prompt is here)
  agents/editor.ts                edit agent: instruction + FloorModel -> FloorModel
  agents/normalize.ts             cleans up whatever JSON the AI returns
  tactile/convert.ts              FloorModel -> plate (the standards live here)
  tactile/braille.ts              letters -> braille dot positions
  tactile/geometry.ts             boxes, domes, rings -> triangles -> STL file
  sample.ts                       the hand-made sample office
  db/                             SQLite database (one "projects" table)

apps/web/src/                     WEBPAGE (Next.js, port 3000)
  app/page.tsx                    landing page
  app/maps/page.tsx               upload + list of maps
  app/projects/[id]/page.tsx      one map: editor and 3D view
  app/the-need-for-this, what-it-does, how-it-works, input-guide, gallery
                                  information pages (text in data/site-pages.ts)
  components/layout/              site header (navigation) and footer
  components/landing/             landing hero, info pages, input guide, gallery
  components/editor/              the editing canvas, toolbar, side panels
  components/preview/             3D viewer (three.js) and export panel
  lib/api.ts                      every call the webpage makes to the backend
  lib/floor-edit.ts               small functions that change a FloorModel
  data/content.ts                 text for the map tool (Vietnamese)
  data/site-pages.ts              text for the information pages (Vietnamese)
public/gallery/                   example plans and STL plates made by bumps
```

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/models` | The models the upload form may offer |
| GET | `/projects` | List all maps |
| POST | `/projects` | Upload an image (form fields `file`, optional `name` and `model`) and start the parser agent |
| POST | `/projects/sample` | Create a map from the built-in sample |
| GET | `/projects/:id` | One map, including its FloorModel and status |
| DELETE | `/projects/:id` | Delete a map |
| GET | `/projects/:id/image` | The uploaded image |
| POST | `/projects/:id/parse` | Run the parser agent again |
| PUT | `/projects/:id/model` | Save an edited FloorModel |
| POST | `/projects/:id/edit` | Edit agent: `{ "instruction": "..." }` |
| GET | `/projects/:id/tactile` | Braille legend and warnings |
| GET | `/projects/:id/map.stl` | The map plate (`?download=1` to save) |
| GET | `/projects/:id/legend.stl` | The legend plate |

## Printing

Print flat, 0.4 mm nozzle, no supports. Any common printer bed fits 200 × 200 mm.

## Checks

```bash
bun run typecheck
bun run lint
```

## What was left out from bumps

Kept simple on purpose. Ideas for extending the capstone:

- A **critique agent** that compares the FloorModel against the image and asks the parser to fix mistakes (bumps ran up to 5 rounds).
- PDF uploads, furniture, walkways and roads.
- Large buildings split across several plates.
- Automatic repair of rule violations (for example moving a braille key that doesn't fit).
- Google sign-in is already wired in `apps/web/src/auth.ts` but not used by any page yet.

## Deploy

Both apps have a Dockerfile, built from the repo root. SQLite and uploads are files on disk, so the API host needs a persistent disk (`DATABASE_PATH`, `UPLOADS_DIR`).
