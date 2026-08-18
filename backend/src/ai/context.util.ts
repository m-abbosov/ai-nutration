import { User } from '@prisma/client';
import { MealResponseDto } from '../meals/dto/meal-response.dto';
import { NutritionDailyDto } from '../nutrition/dto/nutrition-response.dto';
import { AiContext } from './types';

/** Builds the Gemini prompt context from a user's profile + today's
 * nutrition summary. Shared by chat and recommendations so both features
 * feed the model identical, up-to-date context. `recentMeals` (last ~7
 * days, with ids) is optional because recommendations generation doesn't
 * need meal-edit targeting — only chat does. */
export function buildAiContext(
  user: User,
  daily: NutritionDailyDto,
  recentMeals: MealResponseDto[] = [],
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
    recentMeals: recentMeals.map((meal) => ({
      id: meal.id,
      date: meal.date,
      mealType: meal.mealType,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      items: meal.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      })),
    })),
    now: new Date(),
  };
}
