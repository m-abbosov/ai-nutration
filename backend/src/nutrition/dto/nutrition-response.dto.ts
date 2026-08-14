import { MealResponseDto } from '../../meals/dto/meal-response.dto';

export interface MacroBreakdownDto {
  consumed: number;
  target: number;
}

export interface NutritionDailyDto {
  date: string;
  target: number;
  consumed: number;
  remaining: number;
  protein: MacroBreakdownDto;
  carbs: MacroBreakdownDto;
  fat: MacroBreakdownDto;
  meals: MealResponseDto[];
}

export interface NutritionWeeklyPointDto {
  date: string;
  label: string;
  consumed: number;
  target: number;
}
