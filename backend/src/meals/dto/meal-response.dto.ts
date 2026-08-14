import { MealSource, MealType } from '@prisma/client';

export interface MealItemResponseDto {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealResponseDto {
  id: string;
  date: string;
  mealType: MealType;
  name: string;
  emoji: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string | null;
  source: MealSource;
  items: MealItemResponseDto[];
  createdAt: string;
}
