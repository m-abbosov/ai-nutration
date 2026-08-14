# NutriAI — Frontend

React + TypeScript + Vite frontend for NutriAI (Phase 1). A faithful port of
`docs/design-reference/NutriAI.dc.html`; see `/DESIGN_MAPPING.md` at the repo
root for the screen → route → component → API mapping.

## Stack

React 19, React Router, Feature-Sliced Design (`app/ pages/ widgets/ features/
entities/ shared/`), Tailwind CSS v4 + shadcn-style primitives, Framer Motion,
Recharts, React Hook Form + Zod, TanStack Query.

## Getting started

```bash
npm install          # from the repo root or from frontend/ (npm workspaces)
cp frontend/.env.example frontend/.env   # set VITE_API_URL / VITE_TELEGRAM_BOT_USERNAME
npm run dev --workspace frontend         # or: cd frontend && npm run dev
```

The app expects a backend at `VITE_API_URL` (default
`http://localhost:3001/api`, see `docs/API_CONTRACT.md`). It still renders
(login screen, loading/error states) if the backend isn't reachable.

## Scripts (run from `frontend/`)

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run lint` — ESLint
- `npm run preview` — preview the production build
