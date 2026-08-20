// Mirrors docs/ADMIN_API_CONTRACT.md exactly. Do not diverge from this shape —
// the admin backend is built independently against the same contract.
import type { Goal, Language, MealDto, MealType, Theme } from "@nutriai/shared/api/types";

export type AdminRoleName = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT";
export type AdminPermissionKey =
  | "DASHBOARD_READ"
  | "USERS_READ"
  | "USERS_UPDATE"
  | "USERS_DISABLE"
  | "NUTRITION_READ"
  | "AI_READ"
  | "AI_LOGS_READ"
  | "CONVERSATIONS_READ"
  | "ANALYTICS_READ"
  | "SYSTEM_READ"
  | "ADMIN_USERS_READ"
  | "ADMIN_USERS_MANAGE"
  | "SETTINGS_MANAGE"
  | "AUDIT_LOGS_READ"
  | "USERS_DELETE"
  | "FEATURE_ACCESS_MANAGE"
  | "FITNESS_READ"
  | "FITNESS_MANAGE";
export type AdminUserStatus = "ACTIVE" | "DISABLED";
export type AiEndpoint = "CHAT" | "RECOMMENDATION";
export type AiProvider = "GEMINI" | "OPENAI" | "CLAUDE" | "GROQ";
export type AiRequestStatus = "SUCCESS" | "ERROR";
export type SystemLogSeverity = "INFO" | "WARNING" | "ERROR";
export type Range = "7d" | "30d" | "90d" | "1y";
export type AnalyticsRange = "7d" | "30d" | "90d" | "custom";
export type HealthStatus = "HEALTHY" | "WARNING" | "ERROR";

export interface AdminMeDto {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  role: { name: AdminRoleName; permissions: AdminPermissionKey[] };
}

export interface KpiDto {
  value: number;
  previousValue: number;
  deltaPct: number | null;
}
export interface SeriesPointDto {
  date: string;
  value: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ---------- Dashboard ----------
export interface AdminDashboardDto {
  kpis: {
    totalUsers: KpiDto;
    activeUsersToday: KpiDto;
    newUsersToday: KpiDto;
    totalMeals: KpiDto;
    aiRequestsToday: KpiDto;
    aiErrorRateToday: KpiDto;
  };
  userGrowth: { date: string; newUsers: number; activeUsers: number }[];
  aiUsage: {
    requestsToday: number;
    requestsThisWeek: number;
    requestsThisMonth: number;
    successCount: number;
    failureCount: number;
    avgResponseTimeMs: number;
    tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | null;
  };
  mealActivity: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    perDay: SeriesPointDto[];
    byMealType: { mealType: MealType; count: number }[];
  };
  userGoals: { goal: Goal; count: number; percent: number }[];
  languageDistribution: { language: Language; count: number; percent: number }[];
  recentActivity: {
    id: string;
    type: "USER_REGISTERED" | "MEAL_LOGGED" | "AI_RECOMMENDATION" | "AI_REQUEST_FAILED";
    label: string;
    userName: string | null;
    createdAt: string;
  }[];
}

// ---------- Users ----------
export interface AdminUserListItemDto {
  id: string;
  name: string;
  email: string | null;
  telegramId: string | null;
  authProvider: "GOOGLE" | "TELEGRAM";
  avatarUrl: string | null;
  goal: Goal | null;
  weightKg: number | null;
  dailyCalorieTarget: number | null;
  mealsCount: number;
  aiRequestsCount: number;
  createdAt: string;
  lastActiveAt: string | null;
  status: AdminUserStatus;
}
export type AdminUserListDto = Paginated<AdminUserListItemDto>;

export interface AdminUserDetailDto {
  profile: {
    id: string;
    name: string;
    avatarUrl: string | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
    goal: Goal | null;
    activityLevel: string | null;
    dailyCalorieTarget: number | null;
    language: Language;
    theme: Theme;
  };
  account: {
    email: string | null;
    telegramId: string | null;
    authProvider: "GOOGLE" | "TELEGRAM";
    createdAt: string;
    lastActiveAt: string | null;
    status: AdminUserStatus;
  };
  nutrition: { mealsCount: number; avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number };
  calorieHistory: SeriesPointDto[];
  aiStats: { requestCount: number; failedCount: number; avgResponseTimeMs: number | null };
  recentMeals: MealDto[];
  recentActivity: { type: "MEAL_LOGGED" | "AI_RECOMMENDATION" | "AI_REQUEST_FAILED"; label: string; createdAt: string }[];
}

export interface AdminUserFeatureDto {
  feature: string;
  grantedAt: string;
}

// ---------- Nutrition ----------
export interface AdminNutritionDto {
  totals: { total: number; today: number; thisWeek: number; thisMonth: number };
  averages: { calories: number; protein: number; carbs: number; fat: number };
  dailyMeals: SeriesPointDto[];
  caloriesDistribution: { bucket: string; count: number }[];
  macroDistribution: { protein: number; carbs: number; fat: number };
  mealTypeDistribution: { mealType: MealType; count: number; percent: number }[];
  topLoggedFoods: { name: string; count: number }[];
}

// ---------- Fitness ----------
export interface AdminFitnessDto {
  totals: { total: number; today: number; thisWeek: number; thisMonth: number };
  averages: { volume: number; durationMin: number; setsPerWorkout: number };
  dailyWorkouts: SeriesPointDto[];
  topExercises: { slug: string; count: number }[];
  categoryDistribution: { category: "COMPOUND" | "ISOLATION" | "CARDIO" | "BODYWEIGHT"; count: number; percent: number }[];
  personalRecordsCount: number;
}

export type ExerciseCategory = "COMPOUND" | "ISOLATION" | "CARDIO" | "BODYWEIGHT";
export type MuscleCode =
  | "CHEST"
  | "UPPER_CHEST"
  | "BACK"
  | "LATS"
  | "TRAPS"
  | "SHOULDERS"
  | "FRONT_DELTS"
  | "SIDE_DELTS"
  | "REAR_DELTS"
  | "BICEPS"
  | "TRICEPS"
  | "FOREARMS"
  | "ABS"
  | "OBLIQUES"
  | "GLUTES"
  | "QUADS"
  | "HAMSTRINGS"
  | "CALVES";
export type ExerciseLanguage = "EN" | "RU" | "UZ";

export interface AdminExerciseListItemDto {
  id: string;
  slug: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleCode;
  equipment: string | null;
  isCustom: boolean;
}

export interface AdminExerciseAliasDto {
  language: ExerciseLanguage;
  alias: string;
  isPrimary: boolean;
}

export interface AdminExerciseMuscleDto {
  muscle: MuscleCode;
  weight: number;
}

export interface AdminExerciseDetailDto extends AdminExerciseListItemDto {
  aliases: AdminExerciseAliasDto[];
  secondaryMuscles: AdminExerciseMuscleDto[];
}

export interface AdminExerciseListDto {
  items: AdminExerciseListItemDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExerciseAliasInput {
  language: ExerciseLanguage;
  alias: string;
  isPrimary?: boolean;
}

export interface CreateExerciseInput {
  slug?: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleCode;
  equipment?: string | null;
  aliases: ExerciseAliasInput[];
  secondaryMuscles?: { muscle: MuscleCode; weight: number }[];
}

export type UpdateExerciseInput = Partial<CreateExerciseInput>;

// ---------- AI ----------
export interface AdminAiOverviewDto {
  requests: number;
  successCount: number;
  failureCount: number;
  errorRatePct: number;
  avgResponseTimeMs: number;
  requestsPerDay: SeriesPointDto[];
  requestsPerEndpoint: { endpoint: AiEndpoint; count: number }[];
  tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number } | null;
}
export interface AdminAiRequestListItemDto {
  id: string;
  createdAt: string;
  userName: string | null;
  endpoint: AiEndpoint;
  provider: AiProvider;
  model: string;
  status: AiRequestStatus;
  responseTimeMs: number;
  errorReason: string | null;
}
export type AdminAiRequestListDto = Paginated<AdminAiRequestListItemDto>;
export interface AdminAiRequestDetailDto extends AdminAiRequestListItemDto {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}

// ---------- Calculators ----------
export interface AdminCalculatorOverviewDto {
  totalUsage: number;
  uniqueUsers: number;
  usagePerDay: SeriesPointDto[];
  usagePerCalculator: { calculatorId: string; count: number }[];
}
export interface AdminCalculatorUsageListItemDto {
  id: string;
  createdAt: string;
  calculatorId: string;
  userName: string | null;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
}
export type AdminCalculatorUsageListDto = Paginated<AdminCalculatorUsageListItemDto>;

// ---------- Conversations ----------
export interface AdminConversationListItemDto {
  id: string;
  userName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}
export type AdminConversationListDto = Paginated<AdminConversationListItemDto>;
export interface AdminChatMessageDto {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}
export interface AdminConversationDetailDto {
  id: string;
  userName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages: AdminChatMessageDto[];
}

// ---------- Analytics ----------
export interface AdminAnalyticsDto {
  userAnalytics: {
    dau: number;
    wau: number;
    mau: number;
    registrations: SeriesPointDto[];
    retention: { day1: number | null; day7: number | null; day30: number | null };
    inactiveUsers: number;
  };
  nutritionAnalytics: { avgCalories: number; avgProtein: number; avgCarbs: number; avgFat: number; avgMealsPerUser: number };
  aiAnalytics: { requests: number; successRatePct: number; errors: number; avgResponseTimeMs: number };
  engagement: { mealsPerActiveUser: number; aiMessagesPerActiveUser: number; recommendationUsageRatePct: number };
}

// ---------- System ----------
export interface AdminSystemHealthDto {
  api: { status: HealthStatus; latencyMs: number };
  database: { status: HealthStatus; latencyMs: number };
  auth: { status: HealthStatus };
  ai: { status: HealthStatus | "UNKNOWN" };
}
export interface AdminSystemLogDto {
  id: string;
  severity: SystemLogSeverity;
  message: string;
  stack: string | null;
  createdAt: string;
}
export type AdminSystemLogListDto = Paginated<AdminSystemLogDto>;

// ---------- Admin team ----------
export interface AdminTeamMemberDto {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  role: AdminRoleName;
  adminActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
export interface AdminAuditLogEntryDto {
  id: string;
  adminName: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress?: string;
  createdAt: string;
}
export interface AdminTeamMemberDetailDto {
  id: string;
  name: string;
  email: string | null;
  role: AdminRoleName;
  permissions: AdminPermissionKey[];
  adminActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  activityLog: AdminAuditLogEntryDto[];
}

// ---------- Settings ----------
export interface AdminSettingsDto {
  general: { appName: string; defaultLanguage: Language; defaultTimezone: string };
  ai: { enabledModels: { provider: AiProvider; model: string }[] };
  featureFlags: { key: string; enabled: boolean; description: string | null; updatedAt: string }[];
}
