import { z } from 'zod';

/**
 * Zod schemas validating Gemini's structured JSON output before it is ever
 * trusted/persisted. Mirrors the "Gemini response contract" documented in
 * the task brief / API_CONTRACT.md metadata shapes.
 */

export const MealTypeSchema = z.enum(['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER']);

export const MealItemSchema = z.object({
  name: z.string().min(1).max(120),
  quantity: z.string().min(1).max(60),
  calories: z.number().min(0).max(5000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
});

export const MealAnalysisSchema = z.object({
  mealName: z.string().min(1).max(120),
  mealType: MealTypeSchema,
  items: z.array(MealItemSchema).min(1),
  total: z.object({
    calories: z.number().min(0).max(10000),
    protein: z.number().min(0).max(1000),
    carbs: z.number().min(0).max(1000),
    fat: z.number().min(0).max(1000),
  }),
});

export const RecommendationSchema = z.object({
  name: z.string().min(1).max(120),
  estimatedCalories: z.number().min(0).max(5000),
  protein: z.number().min(0).max(500).nullable(),
  carbs: z.number().min(0).max(500).nullable(),
  fat: z.number().min(0).max(500).nullable(),
  reason: z.string().min(1).max(500),
});

export const RecommendationsArraySchema = z.array(RecommendationSchema).min(3);

/** Proposed edit to an already-logged meal. `mealId` must be validated by
 * the caller against the user's own recent meals before being trusted for
 * anything beyond display — the AI is never allowed to authorize the
 * mutation itself, only suggest it (see chat.service.ts). */
export const MealEditSchema = z.object({
  mealId: z.string().min(1),
  changes: z
    .object({
      name: z.string().min(1).max(120).optional(),
      mealType: MealTypeSchema.optional(),
      calories: z.number().min(0).max(10000).optional(),
      protein: z.number().min(0).max(1000).optional(),
      carbs: z.number().min(0).max(1000).optional(),
      fat: z.number().min(0).max(1000).optional(),
      servingSize: z.string().max(60).optional(),
      items: z.array(MealItemSchema).min(1).optional(),
    })
    .refine((c) => Object.keys(c).length > 0, {
      message: 'changes must include at least one field',
    }),
});

/**
 * A single exercise line extracted from free-text workout input. The AI's
 * job is ONLY to extract the raw phrase and the sets as stated — it must
 * NOT normalize or guess the canonical exercise name (see the workout rule
 * in prompts.ts). Resolving `rawText` against the exercise catalog happens
 * server-side in chat.service.ts via exercise-matcher.util.ts, so the AI
 * schema never needs to know the catalog and stays stable as it grows.
 */
export const WorkoutSetSchema = z.object({
  setNumber: z.number().int().min(1).max(50),
  weight: z.number().min(0).max(500).nullable(),
  weightUnit: z.enum(['KG', 'LB']).default('KG'),
  reps: z.number().int().min(0).max(200).nullable(),
  durationSec: z.number().int().min(0).max(7200).nullable(),
});

export const WorkoutExerciseSchema = z.object({
  rawText: z.string().min(1).max(120),
  sets: z.array(WorkoutSetSchema).min(1),
});

export const WorkoutAnalysisSchema = z.object({
  exercises: z.array(WorkoutExerciseSchema).min(1),
  notes: z.string().max(300).nullable(),
});

/** Full single-call chat response contract. */
export const GeminiChatResponseSchema = z.object({
  reply: z.string().min(1).max(4000),
  mealAnalysis: MealAnalysisSchema.nullable(),
  recommendations: RecommendationsArraySchema.nullable(),
  mealEdit: MealEditSchema.nullable(),
  workoutAnalysis: WorkoutAnalysisSchema.nullable(),
});

/** Recommendations-only response, forced non-null with >= 3 entries. */
export const GeminiRecommendationsResponseSchema = z.object({
  reply: z.string().min(1).max(4000),
  recommendations: RecommendationsArraySchema,
});

export type MealAnalysis = z.infer<typeof MealAnalysisSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type MealEdit = z.infer<typeof MealEditSchema>;
export type WorkoutSet = z.infer<typeof WorkoutSetSchema>;
export type WorkoutExerciseAnalysis = z.infer<typeof WorkoutExerciseSchema>;
export type WorkoutAnalysis = z.infer<typeof WorkoutAnalysisSchema>;
export type GeminiChatResponse = z.infer<typeof GeminiChatResponseSchema>;
export type GeminiRecommendationsResponse = z.infer<
  typeof GeminiRecommendationsResponseSchema
>;
