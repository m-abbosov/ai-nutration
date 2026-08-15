import { Goal, Language, MealType } from '@prisma/client';
import { KpiDto, SeriesPointDto } from '../../common/dto-types';

export interface AdminDashboardDto {
  kpis: {
    totalUsers: KpiDto;
    activeUsersToday: KpiDto;
    newUsersToday: KpiDto;
    totalMeals: KpiDto;
    aiRequestsToday: KpiDto;
    aiErrorRateToday: KpiDto;
  };
  userGrowth: { date: string; newUsers: number; activeUsers: number }[];
  aiUsage: {
    requestsToday: number;
    requestsThisWeek: number;
    requestsThisMonth: number;
    successCount: number;
    failureCount: number;
    avgResponseTimeMs: number;
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    } | null;
  };
  mealActivity: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    perDay: SeriesPointDto[];
    byMealType: { mealType: MealType; count: number }[];
  };
  userGoals: { goal: Goal; count: number; percent: number }[];
  languageDistribution: {
    language: Language;
    count: number;
    percent: number;
  }[];
  recentActivity: {
    id: string;
    type:
      | 'USER_REGISTERED'
      | 'MEAL_LOGGED'
      | 'AI_RECOMMENDATION'
      | 'AI_REQUEST_FAILED';
    label: string;
    userName: string | null;
    createdAt: string;
  }[];
}
