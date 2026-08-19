import { MealType, WeightUnit } from '@prisma/client';
import { MealAnalysis, Recommendation } from '../../ai/schemas';

export interface MealEditSuggestionItemDto {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealEditSuggestionDto {
  mealId: string;
  changes: {
    name?: string;
    mealType?: MealType;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    servingSize?: string;
    items?: MealEditSuggestionItemDto[];
  };
  current: {
    name: string;
    mealType: MealType;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string | null;
    date: string;
    items: MealEditSuggestionItemDto[];
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
  // Set together: a confident match populates matchedExerciseId/Slug and
  // leaves ambiguousCandidates empty; an ambiguous phrase (e.g. "Yelkaga
  // max") leaves matched* null and populates ambiguousCandidates (2-5); no
  // match at all leaves both empty — see exercise-matcher.util.ts.
  matchedExerciseId: string | null;
  matchedExerciseSlug: string | null;
  ambiguousCandidates: WorkoutAnalysisCandidateDto[];
  sets: WorkoutAnalysisSetDto[];
}

export interface WorkoutAnalysisDto {
  exercises: WorkoutAnalysisExerciseDto[];
  notes: string | null;
}

// This mirrors packages/shared/src/api/types.ts's ChatMessageMetadata — keep
// both in sync when adding a kind (they drifted once already, see git log).
export type ChatMessageMetadata =
  | { kind: 'nutrition_card'; data: MealAnalysis }
  | { kind: 'recommendations'; data: Recommendation[] }
  | { kind: 'meal_edit_suggestion'; data: MealEditSuggestionDto }
  | { kind: 'workout_analysis'; data: WorkoutAnalysisDto }
  | null;

export interface ChatMessageResponseDto {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
  metadata: ChatMessageMetadata;
}

export interface SendMessageResponseDto {
  userMessage: ChatMessageResponseDto;
  assistantMessage: ChatMessageResponseDto;
}
