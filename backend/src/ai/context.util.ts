import { User } from '@prisma/client';
import { NutritionDailyDto } from '../nutrition/dto/nutrition-response.dto';
import { AiContext } from './types';

/** Builds the Gemini prompt context from a user's profile + today's
 * nutrition summary. Shared by chat and recommendations so both features
 * feed the model identical, up-to-date context. */
export function buildAiContext(
  user: User,
  daily: NutritionDailyDto,
): AiContext {
  return {
    profile: {
      name: user.name,
      age: user.age,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      goal: user.goal,
      dailyCalorieTarget: user.dailyCalorieTarget,
      proteinTargetG: user.proteinTargetG,
      carbsTargetG: user.carbsTargetG,
      fatTargetG: user.fatTargetG,
      language: user.language,
    },
    today: {
      consumed: daily.consumed,
      remaining: daily.remaining,
      target: daily.target,
      protein: daily.protein.consumed,
      carbs: daily.carbs.consumed,
      fat: daily.fat.consumed,
    },
    todaysMeals: daily.meals.map((meal) => ({
      name: meal.name,
      mealType: meal.mealType,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    })),
    now: new Date(),
  };
}
