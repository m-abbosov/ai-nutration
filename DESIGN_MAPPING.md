# Design Mapping — NutriAI (Phase 1)

Source of truth: `NutriAI.dc.html` (+ `support.js` runtime, `.thumbnail`) supplied in the
project upload. It is a prototype built with an internal "design component" runtime
(`x-dc` / `sc-if` / `sc-for` / `{{ }}` bindings + a `class Component extends DCLogic`
state/logic block). It is **not** runnable React, but it fully specifies: design tokens,
layout, copy (uz/ru/en), animations, and client-side interaction/state shape. This
document maps every screen in that prototype to the real React route, the components it
decomposes into, and the backend data/endpoints that replace the prototype's hard-coded
mock arrays (`WEEK`, `DAYS14`, `WEIGHTS`, `MSGS0`, etc.).

## Design tokens (carried verbatim into `shared/config/theme.css`)

```
--bg #0b0d0c   --bg2 #0f1211   --surf #151918   --surf2 #1b201e   --surfH #232927
--line rgba(255,255,255,.075)   --line2 rgba(255,255,255,.15)
--tx #e9ede9   --tx2 #99a49f   --tx3 #69736e
--acc oklch(.76 .13 172)  --accD oklch(.60 .115 172)  --accT oklch(.76 .13 172/.13)  --accG oklch(.76 .13 172/.38)
--pro oklch(.72 .12 288)  --proT oklch(.72 .12 288/.15)      (protein · violet)
--carb oklch(.79 .13 72)  --carbT oklch(.79 .13 72/.15)      (carbs · amber)
--fat oklch(.72 .13 18)   --fatT oklch(.72 .13 18/.15)       (fat · red/orange)
```
Light theme (`[data-th=light]`) swaps the same variable names to a warm off-white
palette — see the `<style>` block in `NutriAI.dc.html` lines 14–35 for exact values.

Fonts: `Instrument Sans` (body/UI), `Instrument Serif` italic-capable (headline/serif
accents on hero copy), `IBM Plex Mono` (labels, kcal/gram numerics, timestamps —
`font-variant-numeric: tabular-nums` throughout). Accent color is teal (`oklch 172° hue`);
macro colors are fixed: protein = violet, carbs = amber, fat = red-orange.

Radii/spacing are large and soft (14–26px card radii, 1px hairline borders using
`--line`/`--line2`), cards are flat `--surf` panels, primary buttons are solid `--acc`
pills with dark (`#04120e`) text, secondary buttons are outlined with `--line2`.

## Screens → routes → components → data

| # | Prototype screen (`data-screen-label`) | React route | Key widgets/features | Backend data / endpoint |
|---|---|---|---|---|
| 1 | **Login** (`isAuth`) | `/login` | `pages/login` → `AuthCard` (quote+stats panel + `GoogleSignInButton`, `TelegramLoginWidget` features/auth). Password fields from the mockup are **dropped** — Phase 1 auth is Google + Telegram only per spec. | `GET /auth/google`, `GET /auth/google/callback`, `POST /auth/telegram`, `POST /auth/refresh`, `GET /auth/me` |
| 2 | **Onboarding** (`isOnb`, 4 steps: goal → body metrics → activity → done) | `/onboarding` | `pages/onboarding` → `features/onboarding-wizard` (`GoalStep`, `BodyMetricsStep`, `ActivityStep`, `ResultStep`) using RHF+Zod, stepper dots widget | `POST /users/onboarding` → persists profile, computes & returns `dailyCalorieTarget` + macro split |
| 3 | **Dashboard** (`page.dash`) | `/` (index, inside `AppShell`) | `widgets/dashboard-hero` (calorie ring + status/remaining/meals/streak stat row + day-flow dots), `widgets/macro-overview` (3 macro cards), `widgets/todays-meals` (timeline), `widgets/ai-insight-card`, `widgets/weekly-chart` (SVG bar chart) | `GET /dashboard` (composed: today totals + meals + 7-day chart + latest AI insight) |
| 4 | **AI Chat / Coach** (`page.coach`) | `/chat` and `/chat/:conversationId` | `widgets/chat-sidebar` (`New chat` + history grouped Today/Yesterday/Previous 7 days/Older), `widgets/chat-window` (`ChatMessage`, `NutritionResultCard` with "Add to today's meals", typing indicator, empty-state quick actions, suggestion chips), `features/send-chat-message`, `features/add-meal-from-ai` | `GET /chat/conversations`, `POST /chat/conversations`, `GET /chat/conversations/:id/messages`, `POST /chat/conversations/:id/messages` (→ the user's own configured AI provider via backend), `POST /meals` (add analyzed card) |
| 5 | **Meals** (`page.meals`) | `/meals` | `widgets/meals-summary` (today's total + macro pills + progress bar), `widgets/meal-timeline` (`MealCard` expand/collapse, edit/delete), `features/add-meal` dropdown (AI chat / quick add / manual entry dialog with RHF+Zod) | `GET /meals?date=`, `POST /meals`, `PATCH /meals/:id`, `DELETE /meals/:id` |
| 6 | **Progress** (`page.prog`) | `/progress` | `widgets/calorie-trend-chart` (SVG line+area, range tabs 7/30/90d), stat cards (avg calories, avg protein, adherence ring, successful-days dots), `widgets/weight-card` (current vs goal weight — single-point, no historical chart in Phase 1: multi-point weight tracking is a **future phase**), `widgets/macro-consistency-card` | `GET /nutrition/weekly?days=` (real, from `Meal` aggregation) for the trend chart; weight/goal come from `User` profile fields |
| 7 | **Profile** (`page.prof`) | `/profile` | `widgets/profile-header` (avatar ring, goal/streak chips), `widgets/profile-body-metrics`, `widgets/profile-goal-card` (goal/activity/rate/target), `widgets/macro-split-bar` | `GET /users/me`; edit reuses onboarding form fields via `PATCH /users/me` |
| 8 | **Settings** (`page.set`) | `/settings` | `widgets/settings-appearance` (theme toggle, language select — shadcn `Select`), `widgets/settings-ai` (bring-your-own-key: pick a provider, paste a key, see a masked status badge — provider + last 4 chars + status only, the raw key never round-trips to the client after saving), `widgets/settings-notifications` (3 toggles — UI-only stub in Phase 1, no backend notification delivery), `widgets/settings-account` (sign out) | `PATCH /users/me` (theme/language persisted per user); `POST /users/me/ai-key`, `DELETE /users/me/ai-key` |
| — | **Mobile** (`showMobile`, responsive duplicate w/ bottom tab bar) | same routes, responsive | `widgets/mobile-bottom-nav` (Home/AI/Meals/Progress/Me), `widgets/mobile-add-sheet` — **not a separate route**, it's the `<768px` responsive layout of the above pages (`AppShell` switches sidebar↔bottom-nav by breakpoint) | same endpoints as above |

## Interaction/state notes carried over from `class Component`

- Activity multipliers match Mifflin–St Jeor exactly and are reused verbatim in the
  backend calorie service: sedentary `1.2`, light `1.375`, moderate `1.55`, active `1.725`.
- Goal deltas shown in onboarding (`−0.4 kg`, `0.0 kg`, `+0.3 kg` per week) map to a
  simple, transparent daily kcal adjustment: lose = TDEE − 500, maintain = TDEE,
  gain = TDEE + 300.
- Default macro split (25% protein / 45% carb / 30% fat of target kcal) matches the
  Profile screen's `split` values (120P/220C/65F on a 2000 kcal target) closely and is
  used as the Phase 1 default macro target formula.
- Chat empty-state quick actions (`qa0..qa3`) map to canned prompts sent through the
  same `POST .../messages` endpoint as free text.
- The prototype's `MSGS0`/`CARDS`/`WEEK`/`DAYS14`/`WEIGHTS` are **mock data only** —
  replaced entirely by real persisted rows; the dev seed script (`backend/prisma/seed.ts`)
  uses realistic Uzbek foods (osh, mastava, somsa, tovuq, grechka, tuxum, greek yogurt,
  achichuk, olma, jo'xori) instead of the prototype's placeholders, clearly marked as
  dev-only seed data.
- Language toggle persists `uz|ru|en`; UI strings live in `shared/i18n/locales/*.ts`
  transcribed from the prototype's `T`/`C`/`M`/`S`/`MB` dictionaries (lines 1587–1705 of
  `NutriAI.dc.html`). AI-generated chat/recommendation content is **not** run through the
  UI i18n system — the backend asks the configured AI provider to answer in the user's selected language
  directly.

## Deliberate deviations from the mock (Phase 1 scope discipline)

- Login form's password fields removed (Google + Telegram only — see Step 7 of the spec).
- AI is bring-your-own-key (changed after initial Phase 1 build): each user supplies
  their own Gemini/OpenAI/Claude API key from Settings instead of the app using one
  shared server-side key. Keys are encrypted at rest (`AI_KEY_ENCRYPTION_SECRET`) and
  the client only ever sees provider + last 4 chars + status, never the raw key. AI
  features (chat analysis, recommendations) stay off with an in-app prompt until a
  user adds their own key; nothing else in the app is gated by it.
- Notification toggles are persisted as user preference flags but do not yet trigger any
  delivery mechanism (push/email/telegram) — that is a future phase.
- Weight trend multi-point chart, detailed analytics, and social/streak gamification
  beyond the simple day-streak counter are out of scope (see `docs/PHASE_1.md`).
- `NutritionWeeklyPointDto` carries only `{date,label,consumed,target}` (no per-day
  macro breakdown), so the Progress screen's "avg protein" stat and macro-consistency
  card use *today's* real macros rather than a fabricated multi-day average — see
  `frontend/src/entities/meal/lib/weekly-stats.ts`.
- The Meals "Quick Add from recent foods" option shown in the mock's add-meal menu was
  dropped — there's no "recent foods" endpoint in the API contract. AI Chat and Manual
  Entry remain as the two ways to add a meal.
