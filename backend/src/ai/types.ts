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

/** A meal from the last ~7 days, WITH its id — so the AI coach can
 * reference an already-logged meal when the user asks to correct/edit it.
 * Never used for anything except `mealEdit` targeting. */
export interface AiRecentMealItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AiRecentMeal {
  id: string;
  date: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: AiRecentMealItem[];
}

export interface AiContext {
  profile: AiUserProfile;
  today: AiTodayNutrition;
  todaysMeals: AiTodayMeal[];
  recentMeals: AiRecentMeal[];
  now: Date;
}
