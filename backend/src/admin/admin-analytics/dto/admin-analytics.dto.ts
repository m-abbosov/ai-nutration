import { SeriesPointDto } from '../../common/dto-types';

export interface AdminAnalyticsDto {
  userAnalytics: {
    dau: number;
    wau: number;
    mau: number;
    registrations: SeriesPointDto[];
    retention: {
      day1: number | null;
      day7: number | null;
      day30: number | null;
    };
    inactiveUsers: number;
  };
  nutritionAnalytics: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    avgMealsPerUser: number;
  };
  aiAnalytics: {
    requests: number;
    successRatePct: number;
    errors: number;
    avgResponseTimeMs: number;
  };
  engagement: {
    mealsPerActiveUser: number;
    aiMessagesPerActiveUser: number;
    recommendationUsageRatePct: number;
  };
}
