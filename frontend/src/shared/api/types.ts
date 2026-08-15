// Mirrors docs/API_CONTRACT.md exactly. Do not diverge from this shape —
// the backend is built independently against the same contract.

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE'
export type Goal = 'LOSE' | 'MAINTAIN' | 'GAIN'
export type MealType = 'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER'
export type MealSource = 'MANUAL' | 'AI'
export type Language = 'UZ' | 'RU' | 'EN'
export type Theme = 'LIGHT' | 'DARK'
export type AiProvider = 'GEMINI' | 'OPENAI' | 'CLAUDE'
export type AiKeyStatus = 'OK' | 'EXHAUSTED' | 'INVALID'

export interface UserDto {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  aiProvider: AiProvider | null
  aiKeyLast4: string | null
  aiKeyStatus: AiKeyStatus | null
  aiKeyStatusMessage: string | null
  age: number | null
  heightCm: number | null
  weightKg: number | null
  goalWeightKg: number | null
  gender: Gender | null
  activityLevel: ActivityLevel | null
  goal: Goal | null
  dailyCalorieTarget: number | null
  proteinTargetG: number | null
  carbsTargetG: number | null
  fatTargetG: number | null
  language: Language
  theme: Theme
  notifyDaily: boolean
  notifyWeekly: boolean
  notifyAiTips: boolean
  onboardingCompletedAt: string | null
}

export interface MealItemDto {
  id: string
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface MealDto {
  id: string
  date: string
  mealType: MealType
  name: string
  emoji: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  servingSize: string | null
  source: MealSource
  items: MealItemDto[]
  createdAt: string
}

export interface NutritionDailyDto {
  date: string
  target: number
  consumed: number
  remaining: number
  protein: { consumed: number; target: number }
  carbs: { consumed: number; target: number }
  fat: { consumed: number; target: number }
  meals: MealDto[]
}

export interface NutritionWeeklyPointDto {
  date: string
  label: string
  consumed: number
  target: number
}

export interface DashboardDto {
  daily: NutritionDailyDto
  weekly: NutritionWeeklyPointDto[]
  insight: string | null
  streakDays: number
}

export interface ConversationDto {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface NutritionAnalysisDto {
  mealName: string
  mealType: MealType
  items: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }[]
  total: { calories: number; protein: number; carbs: number; fat: number }
}

export interface RecommendationDto {
  name: string
  estimatedCalories: number
  protein: number | null
  carbs: number | null
  fat: number | null
  reason: string
}

export type ChatMessageMetadata =
  | { kind: 'nutrition_card'; data: NutritionAnalysisDto }
  | { kind: 'recommendations'; data: RecommendationDto[] }
  | null

export interface ChatMessageDto {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: string
  metadata: ChatMessageMetadata
}

export interface AuthTokensDto {
  accessToken: string
  refreshToken: string
  user: UserDto
}

export interface ApiErrorShape {
  statusCode: number
  message: string | string[]
  error?: string
}
