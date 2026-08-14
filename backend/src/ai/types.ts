import { Language, MealType } from '@prisma/client';

export interface AiUserProfile {
  name: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: string | null;
  dailyCalorieTarget: number | null;
  proteinTargetG: number | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
  language: Language;
}

export interface AiTodayNutrition {
  consumed: number;
  remaining: number;
  target: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AiTodayMeal {
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AiContext {
  profile: AiUserProfile;
  today: AiTodayNutrition;
  todaysMeals: AiTodayMeal[];
  now: Date;
}
