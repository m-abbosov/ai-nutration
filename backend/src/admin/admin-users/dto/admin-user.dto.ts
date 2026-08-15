import {
  ActivityLevel,
  Goal,
  Language,
  Theme,
  UserStatus,
} from '@prisma/client';
import { MealResponseDto } from '../../../meals/dto/meal-response.dto';
import { SeriesPointDto } from '../../common/dto-types';

export type AdminAuthProvider = 'GOOGLE' | 'TELEGRAM';

export interface AdminUserListItemDto {
  id: string;
  name: string;
  email: string | null;
  telegramId: string | null;
  authProvider: AdminAuthProvider;
  avatarUrl: string | null;
  goal: Goal | null;
  weightKg: number | null;
  dailyCalorieTarget: number | null;
  mealsCount: number;
  aiRequestsCount: number;
  createdAt: string;
  lastActiveAt: string | null;
  status: UserStatus;
}

export interface AdminUserDetailDto {
  profile: {
    id: string;
    name: string;
    avatarUrl: string | null;
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
    goal: Goal | null;
    activityLevel: ActivityLevel | null;
    dailyCalorieTarget: number | null;
    language: Language;
    theme: Theme;
  };
  account: {
    email: string | null;
    telegramId: string | null;
    authProvider: AdminAuthProvider;
    createdAt: string;
    lastActiveAt: string | null;
    status: UserStatus;
  };
  nutrition: {
    mealsCount: number;
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
  };
  calorieHistory: SeriesPointDto[];
  aiStats: {
    requestCount: number;
    failedCount: number;
    avgResponseTimeMs: number | null;
  };
  recentMeals: MealResponseDto[];
  recentActivity: {
    type: 'MEAL_LOGGED' | 'AI_RECOMMENDATION' | 'AI_REQUEST_FAILED';
    label: string;
    createdAt: string;
  }[];
}
