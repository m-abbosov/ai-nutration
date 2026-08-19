// Mirrors docs/API_CONTRACT.md exactly. Do not diverge from this shape —
// the backend is built independently against the same contract.

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE";
export type Goal = "LOSE" | "MAINTAIN" | "GAIN";
export type MealType = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
export type MealSource = "MANUAL" | "AI";
export type Language = "UZ" | "RU" | "EN";
export type Theme = "LIGHT" | "DARK";
export type AiProvider = "GEMINI" | "OPENAI" | "CLAUDE" | "GROQ";
export type AiKeyStatus = "OK" | "EXHAUSTED" | "INVALID";

// ── Fitness Tracker ──────────────────────────────────────────────────────
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
export type MuscleRole = "PRIMARY" | "SECONDARY";
export type MuscleRegion = "FRONT" | "BACK" | "BOTH";
export type ExerciseCategory = "COMPOUND" | "ISOLATION" | "CARDIO" | "BODYWEIGHT";
export type WeightUnit = "KG" | "LB";
export type WorkoutSource = "MANUAL" | "AI";
export type PRType = "MAX_WEIGHT" | "MAX_REPS" | "MAX_VOLUME" | "EST_1RM";

export interface ExerciseMuscleDto {
  muscle: MuscleCode;
  role: MuscleRole;
  weight: number;
}

export interface ExerciseDto {
  id: string;
  slug: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleCode;
  equipment: string | null;
  muscles: ExerciseMuscleDto[];
}

export interface ExerciseSetDto {
  id: string;
  setNumber: number;
  weight: number | null;
  weightUnit: WeightUnit;
  reps: number | null;
  durationSec: number | null;
  completed: boolean;
}

export interface WorkoutExerciseDto {
  id: string;
  exerciseId: string;
  exerciseSlug: string;
  order: number;
  sets: ExerciseSetDto[];
}

export interface WorkoutDto {
  id: string;
  date: string;
  startedAt: string | null;
  endedAt: string | null;
  durationSec: number | null;
  notes: string | null;
  totalVolume: number;
  estimatedCalories: number | null;
  source: WorkoutSource;
  exercises: WorkoutExerciseDto[];
  createdAt: string;
  newPersonalRecords: DetectedPrDto[];
}

export interface CreateWorkoutExerciseSetInput {
  setNumber: number;
  weight?: number | null;
  weightUnit?: WeightUnit;
  reps?: number | null;
  durationSec?: number | null;
  completed?: boolean;
}

export interface CreateWorkoutExerciseInput {
  exerciseId: string;
  sets: CreateWorkoutExerciseSetInput[];
}

export interface CreateWorkoutInput {
  date?: string;
  durationSec?: number;
  notes?: string;
  source?: WorkoutSource;
  exercises: CreateWorkoutExerciseInput[];
}

export interface MuscleProgressDto {
  muscle: MuscleCode;
  region: MuscleRegion;
  progressScore: number;
  weeklySets: number;
  weeklyVolume: number;
  sessionsCount: number;
  lastTrainedAt: string | null;
}

export interface MuscleDetailDto extends MuscleProgressDto {
  thisWeekVolume: number;
  lastWeekVolume: number;
  volumeChangePct: number | null;
  strengthChangePct: number | null;
}

export interface MuscleTaxonomyDto {
  muscle: MuscleCode;
  region: MuscleRegion;
  sortOrder: number;
}

export interface PersonalRecordDto {
  id: string;
  exerciseId: string;
  exerciseSlug: string;
  recordType: PRType;
  value: number;
  weight: number | null;
  reps: number | null;
  achievedAt: string;
}

export interface DetectedPrDto {
  exerciseId: string;
  recordType: PRType;
  value: number;
  weight: number | null;
  reps: number | null;
}

export interface MuscleBalanceGroupDto {
  volume: number;
  percentage: number;
}

export interface MuscleBalanceDto {
  push: MuscleBalanceGroupDto;
  pull: MuscleBalanceGroupDto;
  legs: MuscleBalanceGroupDto;
  core: MuscleBalanceGroupDto;
}

export interface UserDto {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  aiProvider: AiProvider | null;
  aiKeyLast4: string | null;
  aiKeyStatus: AiKeyStatus | null;
  aiKeyStatusMessage: string | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goalWeightKg: number | null;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
  dailyCalorieTarget: number | null;
  proteinTargetG: number | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
  language: Language;
  theme: Theme;
  notifyDaily: boolean;
  notifyWeekly: boolean;
  notifyAiTips: boolean;
  onboardingCompletedAt: string | null;
}

export interface MealItemDto {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealDto {
  id: string;
  date: string;
  mealType: MealType;
  name: string;
  emoji: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string | null;
  source: MealSource;
  items: MealItemDto[];
  createdAt: string;
}

export interface NutritionDailyDto {
  date: string;
  target: number;
  consumed: number;
  remaining: number;
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
  meals: MealDto[];
}

export interface NutritionWeeklyPointDto {
  date: string;
  label: string;
  consumed: number;
  target: number;
}

export interface DashboardDto {
  daily: NutritionDailyDto;
  weekly: NutritionWeeklyPointDto[];
  insight: string | null;
  streakDays: number;
}

export interface ConversationDto {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionAnalysisDto {
  mealName: string;
  mealType: MealType;
  items: {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  total: { calories: number; protein: number; carbs: number; fat: number };
}

export interface RecommendationDto {
  name: string;
  estimatedCalories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  reason: string;
}

export interface MealEditItemDto {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEditChangesDto {
  name?: string;
  mealType?: MealType;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
  items?: MealEditItemDto[];
}

export interface MealEditSuggestionDto {
  mealId: string;
  changes: MealEditChangesDto;
  current: {
    name: string;
    mealType: MealType;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string | null;
    date: string;
    items: MealEditItemDto[];
  };
}

export interface WorkoutAnalysisSetDto {
  setNumber: number;
  weight: number | null;
  weightUnit: WeightUnit;
  reps: number | null;
  durationSec: number | null;
}

export interface WorkoutAnalysisCandidateDto {
  exerciseId: string;
  slug: string;
}

export interface WorkoutAnalysisExerciseDto {
  rawText: string;
  // Set together — see backend/src/fitness/lib/exercise-matcher.util.ts:
  // a confident match populates matchedExerciseId/Slug and leaves
  // ambiguousCandidates empty; an ambiguous phrase (e.g. "Yelkaga max")
  // leaves matched* null and populates ambiguousCandidates (2-5); no match
  // leaves both empty (render a manual exercise picker for that row).
  matchedExerciseId: string | null;
  matchedExerciseSlug: string | null;
  ambiguousCandidates: WorkoutAnalysisCandidateDto[];
  sets: WorkoutAnalysisSetDto[];
}

export interface WorkoutAnalysisDto {
  exercises: WorkoutAnalysisExerciseDto[];
  notes: string | null;
}

export type ChatMessageMetadata =
  | { kind: "nutrition_card"; data: NutritionAnalysisDto }
  | { kind: "recommendations"; data: RecommendationDto[] }
  | { kind: "meal_edit_suggestion"; data: MealEditSuggestionDto }
  | { kind: "workout_analysis"; data: WorkoutAnalysisDto }
  | null;

export interface ChatMessageDto {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  metadata: ChatMessageMetadata;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface ApiErrorShape {
  statusCode: number;
  message: string | string[];
  error?: string;
}
