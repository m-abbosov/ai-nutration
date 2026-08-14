import { Meal, MealItem } from '@prisma/client';
import { formatDateOnly } from '../common/date.util';
import { MealResponseDto } from './dto/meal-response.dto';

type MealWithItems = Meal & { items: MealItem[] };

export function toMealResponseDto(meal: MealWithItems): MealResponseDto {
  return {
    id: meal.id,
    date: formatDateOnly(meal.date),
    mealType: meal.mealType,
    name: meal.name,
    emoji: meal.emoji,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    servingSize: meal.servingSize,
    source: meal.source,
    items: meal.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })),
    createdAt: meal.createdAt.toISOString(),
  };
}
