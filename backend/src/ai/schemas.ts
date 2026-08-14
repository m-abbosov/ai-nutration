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

/** Full single-call chat response contract. */
export const GeminiChatResponseSchema = z.object({
  reply: z.string().min(1).max(4000),
  mealAnalysis: MealAnalysisSchema.nullable(),
  recommendations: RecommendationsArraySchema.nullable(),
});

/** Recommendations-only response, forced non-null with >= 3 entries. */
export const GeminiRecommendationsResponseSchema = z.object({
  reply: z.string().min(1).max(4000),
  recommendations: RecommendationsArraySchema,
});

export type MealAnalysis = z.infer<typeof MealAnalysisSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type GeminiChatResponse = z.infer<typeof GeminiChatResponseSchema>;
export type GeminiRecommendationsResponse = z.infer<
  typeof GeminiRecommendationsResponseSchema
>;
