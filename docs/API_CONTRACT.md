# API Contract (Phase 1)

Base URL: `${VITE_API_URL}` (frontend) → NestJS backend, default `http://localhost:3001/api`.
Auth: JWT bearer access token in `Authorization: Bearer <token>` header, obtained from
`/auth/*`. All routes below except `/auth/*` and `/health*` require auth.

All responses are JSON. Errors: `{ statusCode, message, error }` (Nest's default HttpException shape).

## Types (shared shape, mirrored in `frontend/src/shared/api/types.ts` and Nest DTOs)

```ts
type Gender = 'MALE' | 'FEMALE' | 'OTHER'
type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE'
type Goal = 'LOSE' | 'MAINTAIN' | 'GAIN'
type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER'
type MealSource = 'MANUAL' | 'AI'
type Language = 'UZ' | 'RU' | 'EN'
type Theme = 'LIGHT' | 'DARK'

interface UserDto {
  id: string; name: string; email: string | null; avatarUrl: string | null;
  age: number | null; heightCm: number | null; weightKg: number | null; goalWeightKg: number | null;
  gender: Gender | null; activityLevel: ActivityLevel | null; goal: Goal | null;
  dailyCalorieTarget: number | null; proteinTargetG: number | null; carbsTargetG: number | null; fatTargetG: number | null;
  language: Language; theme: Theme;
  notifyDaily: boolean; notifyWeekly: boolean; notifyAiTips: boolean;
  onboardingCompletedAt: string | null;
}

interface MealItemDto { id: string; name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }
interface MealDto {
  id: string; date: string; mealType: MealType; name: string; emoji: string | null;
  calories: number; protein: number; carbs: number; fat: number; servingSize: string | null;
  source: MealSource; items: MealItemDto[]; createdAt: string;
}

interface NutritionDailyDto {
  date: string; target: number; consumed: number; remaining: number;
  protein: { consumed: number; target: number }; carbs: { consumed: number; target: number }; fat: { consumed: number; target: number };
  meals: MealDto[];
}
interface NutritionWeeklyPointDto { date: string; label: string; consumed: number; target: number }

interface ConversationDto { id: string; title: string; createdAt: string; updatedAt: string }
interface ChatMessageDto {
  id: string; role: 'USER' | 'ASSISTANT'; content: string; createdAt: string;
  metadata: { kind: 'nutrition_card'; data: NutritionAnalysisDto } | { kind: 'recommendations'; data: RecommendationDto[] } | null;
}

interface NutritionAnalysisDto {
  mealName: string; mealType: MealType;
  items: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }[];
  total: { calories: number; protein: number; carbs: number; fat: number };
}

interface RecommendationDto {
  name: string; estimatedCalories: number; protein: number | null; carbs: number | null; fat: number | null; reason: string;
}
```

## Endpoints

### Auth
- `GET /auth/google` — redirects to Google OAuth consent.
- `GET /auth/google/callback` — Google redirects here; backend issues tokens, redirects to `${FRONTEND_URL}/auth/callback?token=...&refresh=...`.
- `POST /auth/telegram` — body: Telegram Login Widget payload (`id, first_name, last_name?, username?, photo_url?, auth_date, hash`). Verifies HMAC per Telegram docs. Returns `{ accessToken, refreshToken, user: UserDto }`.
- `POST /auth/refresh` — body `{ refreshToken }` → `{ accessToken, refreshToken }`.
- `POST /auth/logout` — invalidates refresh token.
- `GET /auth/me` → `UserDto`.

### Users / Onboarding
- `POST /users/onboarding` — body `{ age, heightCm, weightKg, gender?, activityLevel, goal, goalWeightKg? }` → computes and persists calorie/macro targets, sets `onboardingCompletedAt` → returns `UserDto`.
- `PATCH /users/me` — partial profile/preference update (also used for theme/language) → `UserDto`. If body includes any onboarding metric, recompute targets.

### Meals
- `GET /meals?date=YYYY-MM-DD` → `MealDto[]` for that day (defaults to today).
- `POST /meals` — body: either a manual entry (`mealType, name, calories, protein, carbs, fat, servingSize?`) or an AI-analyzed payload (`mealType, name, items[], source: 'AI'`) → `MealDto`.
- `PATCH /meals/:id` → `MealDto`.
- `DELETE /meals/:id` → `204`.

### Nutrition
- `GET /nutrition/daily?date=YYYY-MM-DD` → `NutritionDailyDto`.
- `GET /nutrition/weekly?days=7` → `NutritionWeeklyPointDto[]`.

### Dashboard
- `GET /dashboard` → `{ daily: NutritionDailyDto; weekly: NutritionWeeklyPointDto[]; insight: string | null; streakDays: number }`.

### Chat
- `GET /chat/conversations` → `ConversationDto[]` (ordered by `updatedAt` desc; frontend groups into Today/Yesterday/Previous 7 days/Older from `updatedAt`).
- `POST /chat/conversations` — body `{}` → `ConversationDto`.
- `GET /chat/conversations/:id/messages` → `ChatMessageDto[]`.
- `POST /chat/conversations/:id/messages` — body `{ content: string }` → `{ userMessage: ChatMessageDto; assistantMessage: ChatMessageDto }`. Backend builds user/nutrition context, calls Gemini, validates structured output, persists both messages.

### Recommendations
- `POST /recommendations` — body `{ mealType?: MealType }` (optional hint, e.g. user asks "what should I eat for lunch") → `{ recommendations: RecommendationDto[] }` (min. 3). Also invoked internally by the chat flow when the user asks a recommendation-shaped question.

### Health
- `GET /health` → `{ status: 'ok' }`.
- `GET /health/gemini` → `{ connected: boolean }` (true iff `GEMINI_API_KEY` is configured; never returns the key).

## Calorie/macro formula (backend `nutrition/calorie.util.ts`, also documented in DESIGN_MAPPING.md)

```
BMR (Mifflin-St Jeor):
  MALE:   10*weightKg + 6.25*heightCm - 5*age + 5
  FEMALE: 10*weightKg + 6.25*heightCm - 5*age - 161
  OTHER:  average of the two (MALE formula - 78)

TDEE = BMR * activityMultiplier[activityLevel]
  SEDENTARY 1.2, LIGHT 1.375, MODERATE 1.55, ACTIVE 1.725

target = goal === 'LOSE' ? TDEE - 500 : goal === 'GAIN' ? TDEE + 300 : TDEE

proteinTargetG = round(target * 0.25 / 4)
carbsTargetG   = round(target * 0.45 / 4)
fatTargetG     = round(target * 0.30 / 9)
```
