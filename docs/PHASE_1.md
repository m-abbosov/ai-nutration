# Phase 1 Scope

NutriAI Phase 1 delivers a working, production-shaped nutrition tracker: real auth, a
real Postgres database, a real NestJS API, and real Gemini-powered meal analysis and
recommendations behind it — not a static frontend prototype. The UI is a faithful React
port of the supplied design (`NutriAI.dc.html`); see `DESIGN_MAPPING.md` for the
screen-by-screen breakdown.

## In scope

**Auth** — Google OAuth (NestJS `passport-google-oauth20`) and Telegram Login Widget
verification (HMAC-SHA256 hash check against `TELEGRAM_BOT_TOKEN`, per Telegram's
documented login-widget protocol — no invented APIs, no fake OTP). JWT access + refresh
tokens, session persisted client-side in memory + httpOnly-friendly refresh flow.

**Onboarding** — age, height, weight, gender (as present in the design), activity level,
goal (lose/maintain/gain). Computes `dailyCalorieTarget` via Mifflin-St Jeor BMR × activity
multiplier, adjusted by goal, plus a default 25/45/30 macro split. Editable later from
Profile.

**Nutrition tracking** — daily calorie target, consumed, remaining, protein/carbs/fat,
meals list, weekly history/chart, computed on demand from `Meal` rows (no denormalized
daily-totals table).

**AI chat** — Gemini-backed nutrition assistant. Free-text meal descriptions are parsed
into structured `{ items[], total }` nutrition data (validated server-side with Zod;
malformed AI output is retried once, then surfaced as a controlled error — never trusted
blindly). Users can add the analyzed result to today's meals. Conversations and messages
persist in Postgres, grouped by Today / Yesterday / Previous 7 days / Older using real
timestamps.

**Recommendations** — `POST /recommendations` gathers the user's goal, calorie target,
today's consumed calories/macros, today's meals, and time of day, sends that context to
Gemini, and returns at least 3 structured suggestions with estimated calories, macros
(where available), and a short rationale.

**Dashboard** — today's calories/remaining/macros, today's meals, 7-day chart, an AI
insight blurb. No hard-coded numbers post-integration; loading skeletons + empty states.

**Settings/Profile** — profile fields, language (uz/ru/en), theme (light/dark), and a
read-only Gemini connection status (the key itself is a server env var, never exposed).

**Responsive** — desktop sidebar layout down to a mobile bottom-tab layout, tested at the
breakpoints listed in the main spec.

## Explicitly out of scope (future phases)

Advanced weight-history tracking & charts, detailed progress analytics beyond the 7-day
trend, social/community features, subscriptions/billing, premium AI features, barcode
scanning, food image recognition, wearable/Apple Health/Google Fit integration, meal
planning & grocery lists, real notification delivery (daily/weekly/AI-tip toggles are
stored but inert), admin panel, coach marketplace, an advanced recommendation engine
beyond the single Gemini-backed endpoint, AI image generation, and gamification beyond
the simple day-streak counter already in the design.

The schema and module boundaries (`meals`, `nutrition`, `chat`, `recommendations`,
`dashboard`, `ai`) are kept intentionally narrow but composable so these can be added
without a rewrite — e.g. a future `WeightEntry` model and `progress` analytics module can
sit next to `Meal` without touching auth/onboarding/chat.
