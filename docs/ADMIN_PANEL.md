# Admin Panel (Phase 2)

An operational/analytics control center for NutriAI, built as an additive layer on
top of the existing Phase 1 product. **Nothing in this phase modifies Phase 1 user
flows, screens, or data shapes** — every change below is either a new file, a new
route, or a small, explicitly-noted touch point in shared code (auth guard, HTTP
exception filter). See `docs/ADMIN_API_CONTRACT.md` for the exact wire contract.

## Architecture decision: one app, isolated route tree

The admin panel is **not** a separate Vite project or a separate deployment. It
lives inside the existing `frontend/` SPA as an isolated route subtree mounted at
`/admin/*`, and inside the existing `backend/` NestJS app as a new top-level
`AdminModule`. Reasoning:

- The task's own preference order lists `frontend/admin/` before a fully separate
  app, and names `/admin` as the preferred URL (a separate subdomain is explicitly
  the fallback "if the existing architecture makes a separate app more
  appropriate" — it doesn't here).
- Phase 1 already has a working, debugged Vercel deployment (`frontend/vercel.json`,
  `.github/workflows/deploy-frontend.yml`) and a working Railway deployment
  (`backend/railway.json`, `.github/workflows/deploy-backend.yml`). A second app
  means a second Vercel project, second domain/DNS, second set of CI secrets —
  real operational cost for no architectural benefit, and directly conflicts with
  "do not unnecessarily restructure."
- A single NestJS process sharing one `PrismaService`/`AiService`/etc. avoids
  duplicating business logic (explicitly forbidden by the brief) far more cleanly
  than two backend deployments would.

**Visual isolation** (the panel must *not* look like the user app) is achieved with
a second, self-contained design-token set scoped under a root wrapper — see
"Frontend structure" below — not with a second build.

**Bundle isolation**: every `/admin/*` page is behind `React.lazy` + route-based
code-splitting, so none of the admin JS/CSS ships in the initial bundle a regular
user downloads at `/`, `/chat`, etc.

## Backend structure

```
backend/src/
  admin/                    — AdminModule: imports every module below
    admin-auth/             — GET /admin/auth/me; the `state=admin` OAuth branch
                               lives in the EXISTING auth/ module (see below), not here
    admin-users/            — /admin/users (view + disable regular users)
    admin-dashboard/        — /admin/dashboard (aggregated overview)
    admin-analytics/        — /admin/analytics
    admin-ai/               — /admin/ai/overview, /admin/ai/requests(/:id)
    admin-conversations/    — /admin/conversations(/:id)
    admin-nutrition/        — /admin/nutrition
    admin-system/           — /admin/system/health, /admin/system/errors
    admin-team/             — /admin/admin-users (role/permission management —
                               named admin-team internally to avoid confusion with
                               admin-users, but the ROUTE stays /admin/admin-users
                               per the brief)
    admin-settings/         — /admin/settings, feature flags
  audit/                    — AuditLogService, used by every admin-* module above
  common/guards/
    admin-auth.guard.ts     — extends the JWT check: adminRoleId set + adminActive
    admin-permission.guard.ts + @RequirePermission(key) decorator
```

Existing modules touched, and exactly how:
- `auth/`: `GET /auth/google` accepts an optional `state=admin` query param, forwarded
  through the OAuth round trip; the callback branches on it to redirect to
  `/admin/auth/callback` instead of `/auth/callback`, and to reject non-admins.
  The no-`state` path is byte-for-byte unchanged.
- `common/guards/jwt-auth.guard.ts` (or `jwt.strategy.ts`, whichever already loads
  the user): add a check that rejects `user.status === 'DISABLED'` — this is the
  one behavioral change to the regular user app in this entire phase, and it's
  additive (a field that's always `'ACTIVE'` today, so no existing user is affected).
- `ai/ai.service.ts`: `generateChatReply`/`generateRecommendations` gain a small
  wrapper that times the call and writes one `AiRequestLog` row per attempt
  (including the schema-validation retry, as its own row) via an injected
  `AiRequestLogService` — no change to their public signatures' business behavior,
  only added observability. Never logs the prompt or the response text.
- `common/filters/http-exception.filter.ts`: for any *unexpected* error (not a
  thrown `HttpException`, or any 5xx), write a `SystemLog` row (severity `ERROR`),
  then continue exactly as before (client still never sees a stack trace).

## RBAC model

**There is no separate admin-account table.** An "admin" is a `User` row with
`adminRoleId` set — the same Google-authenticated account a person already has (or
gets by signing into the regular app once) doubles as their admin identity. This
was an explicit instruction ("do not duplicate User") and it also means admins go
through the exact same, already-audited OAuth flow.

### Roles (seeded, fixed set — `AdminRole.isSystem = true`, not deletable from the UI)

| Role | Intended holder |
|---|---|
| `SUPER_ADMIN` | founders/eng leads — everything, including managing other admins |
| `ADMIN` | operations staff — everything except managing admin accounts/settings |
| `MODERATOR` | support leads — users, nutrition, conversations (with grant), no AI/system internals |
| `SUPPORT` | front-line support — users (read-only) and their own audit trail only |

### Permission → role seed matrix

| Permission | SUPER_ADMIN | ADMIN | MODERATOR | SUPPORT |
|---|:-:|:-:|:-:|:-:|
| `DASHBOARD_READ` | ✓ | ✓ | ✓ | ✓ |
| `USERS_READ` | ✓ | ✓ | ✓ | ✓ |
| `USERS_UPDATE` | ✓ | ✓ | ✓ | – |
| `USERS_DISABLE` | ✓ | ✓ | – | – |
| `NUTRITION_READ` | ✓ | ✓ | ✓ | – |
| `AI_READ` | ✓ | ✓ | – | – |
| `AI_LOGS_READ` | ✓ | ✓ | – | – |
| `CONVERSATIONS_READ` | ✓ | ✓ | – | – |
| `ANALYTICS_READ` | ✓ | ✓ | – | – |
| `SYSTEM_READ` | ✓ | ✓ | – | – |
| `ADMIN_USERS_READ` | ✓ | – | – | – |
| `ADMIN_USERS_MANAGE` | ✓ | – | – | – |
| `SETTINGS_MANAGE` | ✓ | – | – | – |
| `AUDIT_LOGS_READ` | ✓ | – | – | – |

`CONVERSATIONS_READ` is deliberately **not** granted to `MODERATOR` by default even
though they can see conversation *metadata* (title, message count) — reading
message *content* requires the explicit grant, matching "user chat content should
not be visible to every admin by default." A `SUPER_ADMIN` can grant it to a
specific `MODERATOR`-role admin only by creating a **custom** role via the seed
matrix being data (not hardcoded) — Phase 2 ships the four fixed roles above with
this matrix; per-admin permission overrides are a natural follow-up, not built now
(avoids the "unnecessarily complex" trap).

This matrix is seeded by `backend/prisma/seed.ts` (extended, not replaced — the
existing Phase 1 dev-food seed stays). Seeding is idempotent (`upsert` on the
unique `AdminPermissionKey`/`AdminRoleName`), safe to re-run against production.

### Enforcement

Every `/admin/*` controller method: `@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)`
`@RequirePermission('X_READ')`. `AdminAuthGuard` runs first and 403s anyone who
isn't `adminRoleId != null && adminActive` — cheaply, from the already-loaded JWT
user, no extra query beyond what `JwtAuthGuard` already does. **Frontend route
guards exist only for UX** (redirecting to `/admin/login` before a flash of
unauthorized content) — they are not a security boundary; every one of the routes
in `docs/ADMIN_API_CONTRACT.md` is independently enforced server-side, and the
backend agent must write a test proving a non-admin JWT gets `403` on at least one
representative route per module.

## Audit log

`AuditLog` rows are written for: admin login/denied login, viewing a user detail,
changing a user's status, changing an admin's role/active state, viewing a
conversation's content, changing a setting, toggling a feature flag. Conversation
views are logged on **every** access, unconditionally — this is the one privacy
guarantee that must never be skipped. IP address is captured from the request
(`req.ip`, respecting `X-Forwarded-For` behind Railway's proxy) — stored, not
displayed to anyone below `AUDIT_LOGS_READ`.

## AI request logging & privacy

`AiRequestLog` never stores a prompt or a response body — only metadata (endpoint,
provider, model, status, timing, token counts *if the provider SDK returned them*).
This is a hard rule, not a Phase 2 shortcut: the app already asks users to paste
their own third-party API key (BYOK); logging what they typed into the chat box
server-side, beyond what Phase 1 already persists in `ChatMessage` for the user's
own history, would be a meaningful new privacy surface for no admin-analytics
benefit the aggregates above don't already cover.

**Token usage and cost**: token counts are only ever the real numbers a provider's
SDK response included (`usageMetadata`/`usage` fields on Gemini/OpenAI/Claude
responses respectively) — when a call didn't return them, the field stays `null`,
never zero-filled or estimated. **Cost is not shown anywhere in Phase 2** — the app
never sees provider pricing (BYOK means Anthropic/OpenAI/Google bill the user
directly, on whatever plan they're on) and fabricating a cost from public list
prices would violate "never invent token/cost data" the moment a user is on a
different tier or a price changes. If a future phase adds first-party provider
billing, cost can be added then from real invoice data.

## Frontend structure

```
frontend/src/admin/
  app/            — AdminApp shell: its own QueryClient (or the existing one —
                     agent's call), its own theme provider scoped to this subtree,
                     admin router
  pages/          — dashboard, users, user-detail, nutrition, ai, ai-request-detail,
                     conversations, conversation-detail, analytics, system,
                     system-errors, admin-users, admin-user-detail, settings, login
  widgets/        — AdminSidebar, AdminHeader, UsersTable, AiRequestsTable, etc.
  features/       — permission-gated actions (disable-user, change-role, toggle-flag, ...)
  shared/
    ui/           — AdminSidebar, KpiCard, DataTable, ChartCard, FilterBar,
                     DateRangePicker, StatusBadge, EmptyState, ErrorState,
                     DetailDrawer, ConfirmDialog — built once, reused everywhere,
                     not duplicated per page
    api/          — TanStack Query hooks calling docs/ADMIN_API_CONTRACT.md 1:1
    rbac/         — usePermission('X_READ') hook reading role from GET /admin/auth/me,
                     an <IfPermission> gate, and a route guard component
    theme/        — the admin design tokens (a *different* palette/type scale than
                     the user app's `app/styles/theme.css` — professional dense SaaS
                     aesthetic: neutral grays, a single restrained accent, tabular
                     data-first typography), scoped under an `.admin-root` class so
                     it never leaks into `/`, `/chat`, etc. and vice versa
```

`frontend/src/app/router.tsx` gains one lazy-loaded branch: `/admin/*` → `AdminApp`.
Everything under it is a separate `React.lazy` chunk. Reuses the existing
`shared/i18n` infrastructure (uz/ru/en) — admin strings live in the same locale
files under a new `admin` namespace key, not a parallel i18n system.

## What's intentionally *not* built in Phase 2

- Per-login history for regular users (only `lastLoginAt`, overwritten) — so the
  dashboard's "recent activity" feed does not include a recurring "X logged in"
  event; see `docs/ADMIN_API_CONTRACT.md`.
- Editable general settings (app name / default language / timezone) — displayed
  read-only; wiring them to actually change app behavior needs a real
  `AppSettings` singleton and touch points across the user app that are out of
  scope for "add an admin panel."
- Per-admin custom permission overrides beyond the four seeded roles.
- Cost estimation for AI usage (see above).
- A separate admin account/invite system — admins are promoted from existing users.

## Local development

```bash
cd backend
npx prisma migrate dev --name add_admin_panel   # applies the Phase 2 schema additions
npm run seed                                     # extended: also seeds AdminRole/AdminPermission
                                                  # and promotes the dev seed user to SUPER_ADMIN
npm run start:dev
```

Then sign in at `http://localhost:5173/admin/login` with the same Google account
used for the seeded dev user (or promote your own account:
`UPDATE users SET "adminRoleId" = (SELECT id FROM admin_roles WHERE name = 'SUPER_ADMIN') WHERE email = 'you@example.com';`).

## Production deployment

No new infrastructure. The existing `deploy-backend.yml`/`deploy-frontend.yml`
pipelines pick this up automatically — `railway.json`'s `deploy.startCommand`
already runs `prisma migrate deploy` before every boot, so the new migration
applies itself on the next backend deploy. No new environment variables are
required (admin auth reuses `GOOGLE_CLIENT_ID`/`SECRET`/`CALLBACK_URL`).

To grant the first `SUPER_ADMIN` in production (no UI can do this — a `SUPER_ADMIN`
is required to create the next one, so the very first one is a manual step):
```sql
UPDATE users SET "adminRoleId" = (SELECT id FROM admin_roles WHERE name = 'SUPER_ADMIN'), "adminActive" = true
WHERE email = 'the-founder@example.com';
```
