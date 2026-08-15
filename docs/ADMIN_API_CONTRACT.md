# Admin API Contract (Phase 2)

All routes below are mounted under the existing global `/api` prefix, so e.g.
`GET /admin/dashboard` is actually `GET /api/admin/dashboard`. Auth: the same JWT
bearer access token issued by `/auth/*` — an "admin" is simply a `User` row with
`adminRoleId` set and `adminActive: true`. See `docs/ADMIN_PANEL.md` for the RBAC
model, guard implementation, and audit logging rules referenced throughout this doc.

Every route requires: valid JWT → `user.adminRoleId != null && user.adminActive` →
the specific `AdminPermissionKey` named in parentheses. Missing/invalid JWT → `401`.
Not an admin, or admin disabled → `403 { message: "Not an admin" }`. Missing the
named permission → `403 { message: "Missing permission: <KEY>" }`.

## Types

```ts
type AdminRoleName = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT'
type AdminPermissionKey =
  | 'DASHBOARD_READ' | 'USERS_READ' | 'USERS_UPDATE' | 'USERS_DISABLE'
  | 'NUTRITION_READ' | 'AI_READ' | 'AI_LOGS_READ' | 'CONVERSATIONS_READ'
  | 'ANALYTICS_READ' | 'SYSTEM_READ' | 'ADMIN_USERS_READ' | 'ADMIN_USERS_MANAGE'
  | 'SETTINGS_MANAGE' | 'AUDIT_LOGS_READ'
type UserStatus = 'ACTIVE' | 'DISABLED'
type AiEndpoint = 'CHAT' | 'RECOMMENDATION'
type AiRequestStatus = 'SUCCESS' | 'ERROR'
type SystemLogSeverity = 'INFO' | 'WARNING' | 'ERROR'
type Range = '7d' | '30d' | '90d' | '1y'

interface AdminMeDto {
  id: string; name: string; email: string | null; avatarUrl: string | null
  role: { name: AdminRoleName; permissions: AdminPermissionKey[] }
}

interface KpiDto { value: number; previousValue: number; deltaPct: number | null } // deltaPct null when previousValue is 0
interface SeriesPointDto { date: string; value: number }
```

## Auth (`admin-auth` module)

- `GET /auth/google?state=admin` — **reuses the existing Google strategy**, no new
  OAuth app. The controller forwards `state` through the OAuth round-trip (Google
  echoes it back verbatim on callback). This is the only change to the existing
  `auth/` module for Phase 2.
- `GET /auth/google/callback` — when `state === 'admin'`: if the authenticated user
  has `adminRoleId` set and `adminActive`, write `AuditLog{action:'ADMIN_LOGIN'}`,
  set `lastLoginAt = now()`, redirect to `${FRONTEND_URL}/admin/auth/callback?token=&refresh=`.
  If not an admin, write `AuditLog{action:'ADMIN_LOGIN_DENIED', targetType:'User', targetId:<their id>}`
  and redirect to `${FRONTEND_URL}/admin/auth/callback?error=not_admin` (no tokens).
  When `state` is absent/anything else, behavior is **byte-for-byte unchanged** from
  Phase 1 (redirects to `/auth/callback` as today) — this must not regress the
  regular user login flow.
- `GET /admin/auth/me` (any admin) → `AdminMeDto`.
- Logout: reuse `POST /auth/logout` as-is, no admin-specific variant needed.

Telegram admin login is out of scope for Phase 2 (Google only for staff) — the
regular user app's Telegram login is untouched.

## Dashboard (`admin-dashboard` module) — `DASHBOARD_READ`

`GET /admin/dashboard?range=7d|30d|90d|1y` (default `7d`) — **one call, no N+1**:

```ts
interface AdminDashboardDto {
  kpis: {
    totalUsers: KpiDto; activeUsersToday: KpiDto; newUsersToday: KpiDto
    totalMeals: KpiDto; aiRequestsToday: KpiDto; aiErrorRateToday: KpiDto // value/previousValue are 0-100
  }
  userGrowth: { date: string; newUsers: number; activeUsers: number }[] // one point per day across `range`
  aiUsage: {
    requestsToday: number; requestsThisWeek: number; requestsThisMonth: number
    successCount: number; failureCount: number; avgResponseTimeMs: number
    tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | null // null iff zero rows in range have token data
  }
  mealActivity: {
    total: number; today: number; thisWeek: number; thisMonth: number
    perDay: SeriesPointDto[]
    byMealType: { mealType: MealType; count: number }[]
  }
  userGoals: { goal: Goal; count: number; percent: number }[] // only users with goal set
  languageDistribution: { language: Language; count: number; percent: number }[]
  recentActivity: {
    id: string
    type: 'USER_REGISTERED' | 'MEAL_LOGGED' | 'AI_RECOMMENDATION' | 'AI_REQUEST_FAILED'
    label: string // pre-formatted, e.g. "New user registered via Google"
    userName: string | null
    createdAt: string
  }[] // newest first, capped ~20, merged from real User/Meal/AiRequestLog rows only
}
```

`activeUsersToday` = distinct users with a `Meal` or `ChatMessage` created today.
"Google/Telegram authentication" as a recurring activity-feed item is **not**
fabricated — there is no per-login log for regular users (only `lastLoginAt`,
which is overwritten, not appended) — so auth provider is surfaced by labeling the
`USER_REGISTERED` event, not as a separate recurring event type. Document this
choice in `docs/ADMIN_PANEL.md`.

## Users (`admin-users` module)

- `GET /admin/users` (`USERS_READ`) — query: `page` (default 1), `pageSize`
  (default 20, max 100), `search` (matches name/email, case-insensitive), `goal`,
  `authProvider` (`google`|`telegram`), `status` (`ACTIVE`|`DISABLED`),
  `registeredFrom`, `registeredTo` (ISO dates), `sortBy` (`createdAt`|`lastActiveAt`|`name`),
  `sortDir` (`asc`|`desc`). **Server-side pagination — never return the full table.**
  →
  ```ts
  interface AdminUserListItemDto {
    id: string; name: string; email: string | null; telegramId: string | null
    authProvider: 'GOOGLE' | 'TELEGRAM'; avatarUrl: string | null
    goal: Goal | null; weightKg: number | null; dailyCalorieTarget: number | null
    mealsCount: number; aiRequestsCount: number
    createdAt: string; lastActiveAt: string | null; status: UserStatus
  }
  interface AdminUserListDto { items: AdminUserListItemDto[]; total: number; page: number; pageSize: number }
  ```
  `lastActiveAt` = `max(lastLoginAt, most recent Meal.createdAt, most recent ChatMessage.createdAt)`,
  computed per row — acceptable at page-size scale (≤100 rows), do not compute
  this for the whole table.

- `GET /admin/users/:id` (`USERS_READ`) — writes `AuditLog{action:'USER_VIEWED', targetType:'User', targetId}`.
  →
  ```ts
  interface AdminUserDetailDto {
    profile: { id, name, avatarUrl, age, heightCm, weightKg, goal, activityLevel, dailyCalorieTarget, language, theme }
    account: { email, telegramId, authProvider, createdAt, lastActiveAt, status: UserStatus }
    nutrition: { mealsCount: number; avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number }
    calorieHistory: SeriesPointDto[] // last 30 days, consumed calories per day (0 for days with no meals)
    aiStats: { requestCount: number; failedCount: number; avgResponseTimeMs: number | null }
    recentMeals: MealDto[] // last 10, reuse the existing MealDto shape from docs/API_CONTRACT.md
    recentActivity: { type: 'MEAL_LOGGED' | 'AI_RECOMMENDATION' | 'AI_REQUEST_FAILED'; label: string; createdAt: string }[] // this user's own last ~15
  }
  ```
  This endpoint does **not** include conversation content — see Conversations below.

- `PATCH /admin/users/:id/status` (`USERS_DISABLE`) — body `{ status: UserStatus }`.
  Writes `AuditLog{action:'USER_STATUS_CHANGED', targetType:'User', targetId, metadata:{from,to}}`.
  A `DISABLED` user's JWT is rejected on their next request (checked in the existing
  `JwtAuthGuard`/`JwtStrategy` — the one deliberate touch to shared auth code, gated
  behind a cheap `status` check already available on the loaded user).

## Nutrition (`admin-nutrition` module) — `NUTRITION_READ`

`GET /admin/nutrition?range=7d|30d|90d|1y` →
```ts
interface AdminNutritionDto {
  totals: { total: number; today: number; thisWeek: number; thisMonth: number }
  averages: { calories: number; protein: number; carbs: number; fat: number } // per meal, across range
  dailyMeals: SeriesPointDto[]
  caloriesDistribution: { bucket: string; count: number }[] // e.g. "0-300","300-600",... fixed 300-wide buckets
  macroDistribution: { protein: number; carbs: number; fat: number } // avg grams, for a stacked/donut chart
  mealTypeDistribution: { mealType: MealType; count: number; percent: number }[]
  topLoggedFoods: { name: string; count: number }[] // grouped by trimmed/lowercased Meal.name, top 10 — as logged, not normalized against any food database
}
```

## AI / Gemini (`admin-ai` module)

- `GET /admin/ai/overview?range=` (`AI_READ`) →
  ```ts
  interface AdminAiOverviewDto {
    requests: number; successCount: number; failureCount: number
    errorRatePct: number; avgResponseTimeMs: number
    requestsPerDay: SeriesPointDto[]
    requestsPerEndpoint: { endpoint: AiEndpoint; count: number }[]
    tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | null
  }
  ```
- `GET /admin/ai/requests` (`AI_LOGS_READ`) — query: `page`, `pageSize`, `status`,
  `endpoint`, `userId`, `from`, `to`. → paginated list, same envelope shape as
  `AdminUserListDto` but `items: AdminAiRequestListItemDto[]`:
  ```ts
  interface AdminAiRequestListItemDto {
    id: string; createdAt: string; userName: string | null
    endpoint: AiEndpoint; provider: AiProvider; model: string
    status: AiRequestStatus; responseTimeMs: number; errorReason: string | null
  }
  ```
- `GET /admin/ai/requests/:id` (`AI_LOGS_READ`) → full row (same fields as the list
  item plus `promptTokens`/`completionTokens`/`totalTokens`). **Never** includes a
  prompt or response body — none is ever stored, by design (see schema comment on
  `AiRequestLog`). No API keys anywhere in this response.

## Conversations (`admin-conversations` module)

- `GET /admin/conversations` (`CONVERSATIONS_READ` is **not** required for this list
  — only for the detail route below) — query: `page`, `pageSize`, `search` (title),
  `userId`. →
  ```ts
  interface AdminConversationListItemDto {
    id: string; userName: string; title: string
    createdAt: string; updatedAt: string; messageCount: number
  }
  ```
  Metadata only — never message content, regardless of permission.
- `GET /admin/conversations/:id` (`CONVERSATIONS_READ`, required) → the conversation
  plus its full `ChatMessageDto[]` (reuse the shape from `docs/API_CONTRACT.md`).
  Writes `AuditLog{action:'CONVERSATION_VIEWED', targetType:'Conversation', targetId, metadata:{ownerUserId}}`
  on **every** access, no exceptions — this is the one audit event that must never
  be skipped, per the privacy requirement in `docs/ADMIN_PANEL.md`.

## Analytics (`admin-analytics` module) — `ANALYTICS_READ`

`GET /admin/analytics?range=7d|30d|90d|custom&from=&to=` →
```ts
interface AdminAnalyticsDto {
  userAnalytics: {
    dau: number; wau: number; mau: number
    registrations: SeriesPointDto[]
    retention: { day1: number | null; day7: number | null; day30: number | null } // percent 0-100, null = "not enough data"
    inactiveUsers: number // no Meal/ChatMessage in the last 30 days
  }
  nutritionAnalytics: { avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number; avgMealsPerUser: number }
  aiAnalytics: { requests: number; successRatePct: number; errors: number; avgResponseTimeMs: number }
  engagement: { mealsPerActiveUser: number; aiMessagesPerActiveUser: number; recommendationUsageRatePct: number } // recs requested / active users
}
```
Retention cohort size threshold: if fewer than 5 users registered on the relevant
cohort day, return `null` for that bucket (frontend renders "Not enough data") —
never divide-by-zero or show a fabricated percentage.

## System (`admin-system` module) — `SYSTEM_READ`

- `GET /admin/system/health` →
  ```ts
  interface AdminSystemHealthDto {
    api: { status: 'HEALTHY'|'WARNING'|'ERROR'; latencyMs: number } // self-timed no-op
    database: { status: 'HEALTHY'|'WARNING'|'ERROR'; latencyMs: number } // real `SELECT 1` via Prisma, timed
    auth: { status: 'HEALTHY'|'WARNING'|'ERROR' } // HEALTHY unless the process can't reach its own DB (mirrors `database`)
    ai: { status: 'HEALTHY'|'WARNING'|'ERROR'|'UNKNOWN' } // derived from AiRequestLog success ratio over the last 50 requests / 15 min — UNKNOWN if no recent requests. BYOK means there is no single shared provider connection to probe; do not fake a ping.
  }
  ```
- `GET /admin/system/errors` — query: `page`, `pageSize`, `severity`, `from`, `to`.
  → paginated `SystemLog` rows. `stack` is included in the response only for
  `SYSTEM_READ` holders (i.e. anyone who can reach this route at all — there is no
  finer sub-permission for stack visibility, by design, see `docs/ADMIN_PANEL.md`).

`SystemLog` rows are written by the existing `common/filters/http-exception.filter.ts`
for any *unexpected* (non-`HttpException`, or 5xx) error — 4xx validation errors are
intentionally not logged here (that would just be noise; they're not system errors).

## Admin team management (`admin-team` module, routes stay `/admin/admin-users` per spec)

- `GET /admin/admin-users` (`ADMIN_USERS_READ`) → users with `adminRoleId != null`:
  `{ id, name, email, avatarUrl, role: AdminRoleName, adminActive, lastLoginAt, createdAt }[]`.
- `POST /admin/admin-users` (`ADMIN_USERS_MANAGE`) — body `{ userId: string, role: AdminRoleName }`.
  Promotes an **existing** regular user (found by `userId` — there is no
  invite-a-brand-new-person flow; they must already have signed in once via Google)
  to admin. Writes `AuditLog{action:'ADMIN_ROLE_CHANGED', targetType:'User', targetId:userId, metadata:{from:null,to:role}}`.
- `GET /admin/admin-users/:id` (`ADMIN_USERS_READ`) →
  `{ id, name, email, role: AdminRoleName, permissions: AdminPermissionKey[], adminActive, createdAt, lastLoginAt, activityLog: AuditLog[] }`
  where `activityLog` is **this admin's own** `AuditLog` rows (`adminId = :id`), last 20.
- `PATCH /admin/admin-users/:id` (`ADMIN_USERS_MANAGE`) — body `{ role?: AdminRoleName; adminActive?: boolean }`.
  **Must reject** (`400`) a request where `:id === requester.id` and the change
  would either set `adminActive: false` or change `role` away from `SUPER_ADMIN`
  while the requester currently holds `SUPER_ADMIN` — an admin can never lock
  themselves out. Writes `ADMIN_ROLE_CHANGED` and/or `ADMIN_USER_STATUS_CHANGED`
  as applicable.

## Audit log — `GET /admin/audit-logs` (`AUDIT_LOGS_READ`)

Query: `page`, `pageSize`, `adminId`, `action`, `from`, `to`. → paginated
`{ id, adminName, action, targetType, targetId, metadata, ipAddress, createdAt }[]`.

## Settings (`admin-settings` module)

- `GET /admin/settings` (any admin) →
  ```ts
  interface AdminSettingsDto {
    general: { appName: string; defaultLanguage: Language; defaultTimezone: string } // read-only display in Phase 2, sourced from constants — see docs/ADMIN_PANEL.md for why these aren't yet persisted/editable
    ai: { enabledModels: { provider: AiProvider; model: string }[] } // read-only — reflects GEMINI_MODEL/OPENAI_MODEL/CLAUDE_MODEL env vars, never a key
    featureFlags: { key: string; enabled: boolean; description: string | null; updatedAt: string }[]
  }
  ```
- `PATCH /admin/settings/feature-flags/:key` (`SETTINGS_MANAGE`) — body `{ enabled: boolean }`.
  Writes `AuditLog{action:'FEATURE_FLAG_CHANGED', targetType:'FeatureFlag', targetId:key, metadata:{from,to}}`.
  Seeded flags (see `docs/ADMIN_PANEL.md` for the seed list): `AI_CHAT_ENABLED`,
  `RECOMMENDATIONS_ENABLED`, `GOOGLE_AUTH_ENABLED`, `TELEGRAM_AUTH_ENABLED`,
  `MAINTENANCE_MODE`. Each is actually **enforced** at its real call site (chat
  send, recommendations generate, the two OAuth/Telegram auth endpoints, and a
  global maintenance check respectively) — a flag that does nothing is worse than
  no flag.

## Error shape

Unchanged from `docs/API_CONTRACT.md` — Nest's default `{ statusCode, message, error }`.
