import { Language, MealType } from '@prisma/client';
import { AiContext } from './types';

const LANGUAGE_NAME: Record<Language, string> = {
  UZ: 'Uzbek',
  RU: 'Russian',
  EN: 'English',
};

function formatContext(context: AiContext): string {
  const { profile, today, todaysMeals, recentMeals, now } = context;

  const mealsList = todaysMeals.length
    ? todaysMeals
        .map(
          (m) =>
            `- ${m.mealType}: ${m.name} (${m.calories} kcal, P${m.protein}g/C${m.carbs}g/F${m.fat}g)`,
        )
        .join('\n')
    : '(no meals logged yet today)';

  const recentMealsList = recentMeals.length
    ? recentMeals
        .map(
          (m) =>
            `- id="${m.id}" | ${m.date} ${m.mealType}: ${m.name} (${m.calories} kcal, P${m.protein}g/C${m.carbs}g/F${m.fat}g)`,
        )
        .join('\n')
    : '(no meals logged in the last 7 days)';

  return `
User profile:
- Name: ${profile.name}
- Age: ${profile.age ?? 'unknown'}
- Height: ${profile.heightCm ?? 'unknown'} cm
- Weight: ${profile.weightKg ?? 'unknown'} kg
- Goal: ${profile.goal ?? 'unknown'}
- Daily calorie target: ${profile.dailyCalorieTarget ?? 'unknown'} kcal
- Macro targets: protein ${profile.proteinTargetG ?? '?'}g / carbs ${profile.carbsTargetG ?? '?'}g / fat ${profile.fatTargetG ?? '?'}g

Today's nutrition so far:
- Consumed: ${today.consumed} kcal, remaining: ${today.remaining} kcal (target ${today.target} kcal)
- Protein: ${today.protein}g, Carbs: ${today.carbs}g, Fat: ${today.fat}g

Today's logged meals:
${mealsList}

Recently logged meals, last 7 days (for corrections/edits only — each has its own "id"):
${recentMealsList}

Current date/time: ${now.toISOString()}
`.trim();
}

/**
 * Chat prompt: asks Gemini for a single strict-JSON reply matching the
 * chat response contract. mealAnalysis is populated only when the user's
 * message describes a meal to log; recommendations only when the user
 * asks a recommendation-shaped question ("what should I eat").
 */
export function buildChatPrompt(
  context: AiContext,
  userMessage: string,
  isFirstMessage: boolean,
): string {
  const language = LANGUAGE_NAME[context.profile.language];
  const greetingRule = isFirstMessage
    ? `- This is the FIRST message in this conversation — start "reply" with the greeting "Assalomu alaykum" (keep it in this exact form regardless of ${language}), then continue the rest of the reply in ${language}.`
    : `- This is NOT the first message in this conversation — do NOT greet the user again (no "Assalomu alaykum", "hello", "salom" or similar opener). Go straight to answering.`;

  return `
You are NutriAI, a friendly, knowledgeable nutrition coach assistant embedded in a
nutrition-tracking app. Respond ONLY in ${language} (except the greeting rule below).
Respond with ONLY strict JSON matching exactly this shape, no markdown, no code fences,
no commentary outside the JSON:

{
  "reply": string,
  "mealAnalysis": null | {
    "mealName": string,
    "mealType": "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER",
    "items": [{ "name": string, "quantity": string, "calories": number, "protein": number, "carbs": number, "fat": number }],
    "total": { "calories": number, "protein": number, "carbs": number, "fat": number }
  },
  "recommendations": null | [{ "name": string, "estimatedCalories": number, "protein": number | null, "carbs": number | null, "fat": number | null, "reason": string }],
  "mealEdit": null | {
    "mealId": string,
    "changes": {
      "name"?: string,
      "mealType"?: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER",
      "calories"?: number,
      "protein"?: number,
      "carbs"?: number,
      "fat"?: number,
      "servingSize"?: string
    }
  }
}

Rules:
${greetingRule}
- If the user described a NEW meal/food they ate (e.g. "I had two eggs and toast"), analyze it and
  populate "mealAnalysis" with realistic nutrition estimates. Otherwise "mealAnalysis" must be null.
- If the user is asking what to eat / for food suggestions, populate "recommendations" with AT LEAST 3
  entries. Otherwise "recommendations" must be null.
- If the user is asking to CORRECT or CHANGE a meal they ALREADY logged (e.g. "actually the lunch I logged
  was bigger, make it 800 kcal", "fix the calories on yesterday's breakfast", "change my dinner name to X"),
  find the matching entry in the "Recently logged meals" list below and populate "mealEdit" with its exact
  "id" (copy it character-for-character — NEVER invent or guess an id) and only the fields that should
  change in "changes" (at least one). If you cannot confidently identify which logged meal the user means,
  leave "mealEdit" null and ask a clarifying question in "reply" instead.
- "reply" is always a short, natural-language, helpful answer in ${language}.
- Exactly one of "mealAnalysis", "recommendations", "mealEdit" may be non-null at a time — never more than one.
- All numbers are non-negative and realistic (a single meal is rarely above 2000 kcal).

${formatContext(context)}

User's message: "${userMessage}"

Respond with ONLY the JSON object.
`.trim();
}

export function buildRecommendationsPrompt(
  context: AiContext,
  mealTypeHint?: MealType,
): string {
  const language = LANGUAGE_NAME[context.profile.language];
  const hint = mealTypeHint
    ? `The user is specifically asking for ${mealTypeHint.toLowerCase()} suggestions.`
    : 'The user has not specified a particular meal type — suggest whatever best fits their remaining calories/macros and the current time of day.';

  return `
You are NutriAI, a nutrition coach assistant. Respond ONLY in ${language}. Respond with
ONLY strict JSON matching exactly this shape, no markdown, no commentary outside the JSON:

{
  "reply": string,
  "recommendations": [{ "name": string, "estimatedCalories": number, "protein": number | null, "carbs": number | null, "fat": number | null, "reason": string }]
}

Rules:
- "recommendations" MUST contain AT LEAST 3 entries, each realistic given the user's remaining
  calories/macros for today and goal.
- "reply" is a short, natural-language framing sentence in ${language}.
- All numbers are non-negative and realistic.

${hint}

${formatContext(context)}

Respond with ONLY the JSON object.
`.trim();
}

export function buildCorrectivePrompt(originalPrompt: string): string {
  return `${originalPrompt}\n\nYour previous response did not match the required JSON schema. Respond again with ONLY valid JSON matching the schema described above — no markdown, no commentary, no code fences.`;
}
