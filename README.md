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
| `AI_KEY_ENCRYPTION_SECRET` | backend | everything (encrypts each user's own AI key at rest — generate with `openssl rand -hex 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | backend | Google sign-in ([console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)) |
| `TELEGRAM_BOT_TOKEN` | backend | Telegram sign-in — create a bot via [@BotFather](https://t.me/BotFather), then `/setdomain` it to your frontend URL |
| `GEMINI_MODEL` / `OPENAI_MODEL` / `CLAUDE_MODEL` | backend | which model to call per provider — no credentials, see below |
| `FRONTEND_URL` | backend | CORS + OAuth redirect target |
| `VITE_API_URL` | frontend | pointing the SPA at the API |
| `VITE_TELEGRAM_BOT_USERNAME` | frontend | rendering the Telegram Login Widget |

AI is bring-your-own-key: there is no shared server-side AI key. Each user adds
their own Gemini/OpenAI/Claude API key from Settings (or skips it during
onboarding); it's encrypted at rest with `AI_KEY_ENCRYPTION_SECRET` and used only
for that user's own chat/recommendations calls. AI features simply stay off for a
user until they add a key — this doesn't block sign-in or the rest of the app.
Google/Telegram sign-in still degrade gracefully when unconfigured (documented per
endpoint in `docs/API_CONTRACT.md`): the app still builds and boots without them,
those specific sign-in options just return a clear 503.

**Secrets never reach the browser.** `AI_KEY_ENCRYPTION_SECRET`, `GOOGLE_CLIENT_SECRET`,
`TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, and every user's AI key are backend-only /
encrypted-at-rest; the frontend's Settings screen only ever sees the provider name,
last 4 characters, and connection status of a saved key, never the key itself.

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

## CI/CD

`.github/workflows/`:

- **`ci.yml`** — runs on every push/PR to any branch: `npm ci`, Prisma generate,
  typecheck, lint, unit tests, and build, for both `backend/` and `frontend/`
  independently. No secrets required.
- **`deploy-backend.yml`** — on push to `main`/`claude/ai-nutrition-phase-1-i5yhp8`
  touching `backend/**` (or manual `workflow_dispatch`): re-verifies the build, then
  deploys to **Railway** via `railway up` using `backend/railway.json`
  (Nixpacks build, `npx prisma migrate deploy` runs automatically before every boot,
  health check on `/api/health`).
- **`deploy-frontend.yml`** — same triggers for `frontend/**`: builds and deploys to
  **Vercel** via the Vercel CLI (`vercel pull` → `vercel build` → `vercel deploy
  --prebuilt`), using `frontend/vercel.json` (Vite framework preset + a SPA rewrite so
  client-side routes like `/chat` or `/settings` don't 404 on refresh).

### One-time setup

**Railway (backend):**
1. Create a project at [railway.app](https://railway.app), add a **PostgreSQL**
   plugin to it (this gives you a `DATABASE_URL`), and add an **empty service**
   (name it e.g. `backend` — the CLI creates/targets it on first deploy).
2. In that service's **Variables**, set: `DATABASE_URL` (reference the Postgres
   plugin, e.g. `${{Postgres.DATABASE_URL}}`), `JWT_SECRET`, `JWT_ACCESS_TTL`,
   `JWT_REFRESH_TTL`, `AI_KEY_ENCRYPTION_SECRET` (required — `openssl rand -hex 32`),
   and whichever of `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_CALLBACK_URL`/
   `TELEGRAM_BOT_TOKEN` you have (optional — see the table above, missing ones
   degrade gracefully). Leave `FRONTEND_URL` for step 4.
3. Service **Settings → Networking → Generate Domain** to get a public backend URL.
4. Service **Settings → Tokens** (or account-level Project Token) → create a token →
   this is `RAILWAY_TOKEN`. If the project has more than one service, also note the
   service name for the `RAILWAY_SERVICE` repo **variable** (not secret).

**Vercel (frontend):**
1. Create a project at [vercel.com](https://vercel.com) importing this repo, with
   **Root Directory = `frontend`**. Since deploys are driven by GitHub Actions here,
   disable Vercel's own Git auto-deploy in **Project Settings → Git** to avoid
   duplicate deployments (the Action calls `vercel deploy` directly).
2. Project **Settings → Environment Variables** (Production): `VITE_API_URL` =
   `https://<your-railway-domain>/api`, and `VITE_TELEGRAM_BOT_USERNAME` if using
   Telegram login.
3. Account **Settings → Tokens** → create `VERCEL_TOKEN`.
4. `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: run `vercel link` once inside `frontend/`
   locally, then read them from the generated `.vercel/project.json` — or find them
   in the project's **Settings → General**.
5. Back on Railway, set `FRONTEND_URL` to this Vercel URL (and, if using Google auth,
   add `https://<railway-domain>/api/auth/google/callback` as an authorized redirect
   URI in the Google Cloud Console) and redeploy.

**GitHub repo** (Settings → Secrets and variables → Actions):
- Secrets: `RAILWAY_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Variables (optional): `RAILWAY_SERVICE` if the Railway project has multiple services.

Once these are set, every push to `main` (or `claude/ai-nutrition-phase-1-i5yhp8`
today) that touches `backend/` or `frontend/` redeploys that side automatically;
`ci.yml` runs on every branch/PR regardless of secrets.

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
