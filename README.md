# NutriAI — Phase 1

AI-powered nutrition tracking. A React/TypeScript frontend and a NestJS/Postgres
backend, with Gemini doing meal analysis and recommendations. This is a
production-shaped Phase 1: real auth, a real database, a real API — not a static
prototype.

The UI is a faithful React port of a supplied HTML/JS design
(`docs/design-reference/NutriAI.dc.html`). Start with **`DESIGN_MAPPING.md`** for the
screen → route → component → API breakdown, and **`docs/PHASE_1.md`** for exactly what
is and isn't in scope this phase.

## Architecture

```
ai-nutration/
├── frontend/   React + TS + Vite, Feature-Sliced Design, Tailwind/shadcn, TanStack Query
├── backend/    NestJS + TypeScript + Prisma/Postgres, JWT auth, Gemini integration
├── docs/
│   ├── PHASE_1.md          — scope: what's in Phase 1, what's future-phase
│   ├── API_CONTRACT.md     — REST endpoints, DTOs, calorie/macro formula
│   └── design-reference/   — the original design prototype (source of truth for UI)
├── DESIGN_MAPPING.md
└── package.json            — npm workspaces root
```

```
React (frontend) ──HTTP──▶ NestJS (backend) ──▶ Postgres (Prisma)
                                             └──▶ Gemini API (server-side only)
```

Gemini is never called from the browser — all AI requests go through the backend's
`ai/` module, which builds the prompt (user profile + today's nutrition + today's
meals + language), validates Gemini's structured JSON response with Zod, and persists
the result. See `docs/API_CONTRACT.md` for the exact response contract.

## Quick start

Requires Node 20+, npm, and a local PostgreSQL instance.

```bash
git clone <repo> && cd ai-nutration
npm install                              # installs both workspaces

# Backend
cp backend/.env.example backend/.env     # fill in DATABASE_URL and JWT_SECRET at minimum
cd backend
npx prisma migrate dev --name init       # creates the schema
npm run seed                             # optional: realistic Uzbek-food dev data
npm run start:dev                        # http://localhost:3001/api
cd ..

# Frontend (separate terminal)
cp frontend/.env.example frontend/.env   # VITE_API_URL defaults to http://localhost:3001/api
npm run dev --workspace frontend         # http://localhost:5173
```

`npm install` at the root runs `backend`'s `postinstall` (`prisma generate`)
automatically via npm workspaces, so the Prisma client is ready immediately.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full, commented list.
Summary:

| Variable | Where | Required for |
|---|---|---|
| `DATABASE_URL` | backend | everything (Postgres connection) |
| `JWT_SECRET` | backend | everything (session tokens) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | backend | Google sign-in ([console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)) |
| `TELEGRAM_BOT_TOKEN` | backend | Telegram sign-in — create a bot via [@BotFather](https://t.me/BotFather), then `/setdomain` it to your frontend URL |
| `GEMINI_API_KEY` | backend | AI chat/recommendations ([aistudio.google.com/apikey](https://aistudio.google.com/apikey)) |
| `FRONTEND_URL` | backend | CORS + OAuth redirect target |
| `VITE_API_URL` | frontend | pointing the SPA at the API |
| `VITE_TELEGRAM_BOT_USERNAME` | frontend | rendering the Telegram Login Widget |

Every feature degrades gracefully when its credentials are missing (documented per
endpoint in `docs/API_CONTRACT.md`): the app still builds and boots without any of
Google/Telegram/Gemini configured — those specific features return a clear 503
instead of crashing the server or the client.

**Secrets never reach the browser.** `GEMINI_API_KEY`, `GOOGLE_CLIENT_SECRET`,
`TELEGRAM_BOT_TOKEN`, and `JWT_SECRET` are backend-only env vars; the frontend's
Settings screen shows only a masked "connected/not connected" badge for Gemini
(`GET /health/gemini`).

## Development commands

```bash
# from repo root, per workspace:
npm run dev:frontend        npm run dev:backend
npm run build:frontend      npm run build:backend
npm run typecheck:frontend  npm run typecheck:backend
npm run lint:frontend       npm run lint:backend

# Prisma (from backend/):
npx prisma migrate dev      npx prisma studio        npm run seed
```

## Production build

```bash
npm run build --workspace backend    # → backend/dist, run with `node dist/main.js`
npm run build --workspace frontend   # → frontend/dist, serve as a static SPA
```

Set `FRONTEND_URL` (backend) and `VITE_API_URL` (frontend) to the deployed origins.
Run `npx prisma migrate deploy` (not `migrate dev`) against the production database.

## Docs

- [`DESIGN_MAPPING.md`](./DESIGN_MAPPING.md) — screen → route → component → API mapping
- [`docs/PHASE_1.md`](./docs/PHASE_1.md) — scope: what's in Phase 1 vs. future phases
- [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md) — REST contract, DTOs, calorie formula
- [`docs/design-reference/`](./docs/design-reference/) — the original design source
- [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma) — the data model
- [`frontend/README.md`](./frontend/README.md) — frontend-specific setup/scripts
