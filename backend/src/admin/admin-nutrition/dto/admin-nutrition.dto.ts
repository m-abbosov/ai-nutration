import { MealType } from '@prisma/client';
import { SeriesPointDto } from '../../common/dto-types';

export interface AdminNutritionDto {
  totals: { total: number; today: number; thisWeek: number; thisMonth: number };
  averages: { calories: number; protein: number; carbs: number; fat: number };
  dailyMeals: SeriesPointDto[];
  caloriesDistribution: { bucket: string; count: number }[];
  macroDistribution: { protein: number; carbs: number; fat: number };
  mealTypeDistribution: {
    mealType: MealType;
    count: number;
    percent: number;
  }[];
  topLoggedFoods: { name: string; count: number }[];
}
