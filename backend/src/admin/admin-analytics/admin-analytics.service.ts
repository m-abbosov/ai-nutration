import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { addDays, formatDateOnly, todayDateOnly } from '../../common/date.util';
import { PrismaService } from '../../database/prisma.service';
import { eachDate } from '../common/range.util';
import { AdminAnalyticsDto } from './dto/admin-analytics.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

const RANGE_DAYS: Record<'7d' | '30d' | '90d', number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveWindow(query: AnalyticsQueryDto): { start: Date; end: Date } {
    const range = query.range ?? '7d';
    if (range === 'custom') {
      if (!query.from || !query.to) {
        throw new BadRequestException(
          'range=custom requires both `from` and `to` query params',
        );
      }
      return { start: new Date(query.from), end: new Date(query.to) };
    }
    const end = todayDateOnly();
    const start = addDays(end, -(RANGE_DAYS[range] - 1));
    return { start, end };
  }

  /** Distinct users active (logged a Meal or sent a ChatMessage) in
   * [gte, lt) — one set-based UNION query, never a per-user loop. */
  private async distinctActiveUserCount(gte: Date, lt: Date): Promise<number> {
    const [{ count }] = await this.prisma.$queryRaw<
      { count: bigint }[]
    >(Prisma.sql`
      SELECT COUNT(DISTINCT user_id)::bigint AS count FROM (
        SELECT "userId" AS user_id FROM meals WHERE date >= ${gte}::date AND date < ${lt}::date
        UNION
        SELECT "userId" AS user_id FROM conversations WHERE "updatedAt" >= ${gte} AND "updatedAt" < ${lt}
      ) x
    `);
    return Number(count);
  }

  private async retentionForBucket(days: 1 | 7 | 30): Promise<number | null> {
    const cohortDay = addDays(todayDateOnly(), -days);
    const cohortEnd = addDays(cohortDay, 1);
    const cohortUsers = await this.prisma.user.findMany({
      where: { createdAt: { gte: cohortDay, lt: cohortEnd } },
      select: { id: true },
    });
    if (cohortUsers.length < 5) return null;

    const ids = cohortUsers.map((u) => u.id);
    const today = todayDateOnly();
    const tomorrow = addDays(today, 1);
    const [{ count }] = await this.prisma.$queryRaw<
      { count: bigint }[]
    >(Prisma.sql`
      SELECT COUNT(DISTINCT user_id)::bigint AS count FROM (
        SELECT "userId" AS user_id FROM meals WHERE date >= ${today}::date AND date < ${tomorrow}::date AND "userId" IN (${Prisma.join(ids)})
        UNION
        SELECT "userId" AS user_id FROM conversations WHERE "updatedAt" >= ${today} AND "updatedAt" < ${tomorrow} AND "userId" IN (${Prisma.join(ids)})
      ) x
    `);
    return Math.round((Number(count) / ids.length) * 1000) / 10;
  }

  async getAnalytics(query: AnalyticsQueryDto): Promise<AdminAnalyticsDto> {
    const window = this.resolveWindow(query);
    const gte = new Date(
      Date.UTC(
        window.start.getUTCFullYear(),
        window.start.getUTCMonth(),
        window.start.getUTCDate(),
      ),
    );
    const lt = new Date(
      Date.UTC(
        window.end.getUTCFullYear(),
        window.end.getUTCMonth(),
        window.end.getUTCDate() + 1,
      ),
    );
    const today = todayDateOnly();
    const tomorrow = addDays(today, 1);

    const [
      totalUsers,
      dau,
      wau,
      mau,
      registrationRows,
      day1,
      day7,
      day30,
      rangeMealAgg,
      rangeMealUsers,
      activeUsersInRange,
      rangeAiTotal,
      rangeAiSuccess,
      rangeAiAvg,
      rangeChatMessages,
      rangeRecommendationRequests,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.distinctActiveUserCount(today, tomorrow),
      this.distinctActiveUserCount(addDays(today, -6), tomorrow),
      this.distinctActiveUserCount(addDays(today, -29), tomorrow),
      this.prisma.$queryRaw<{ day: Date; count: bigint }[]>(Prisma.sql`
        SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*) AS count
        FROM users WHERE "createdAt" >= ${gte} AND "createdAt" < ${lt}
        GROUP BY 1 ORDER BY 1
      `),
      this.retentionForBucket(1),
      this.retentionForBucket(7),
      this.retentionForBucket(30),
      this.prisma.meal.aggregate({
        where: { date: { gte: window.start, lte: window.end } },
        _count: true,
        _avg: { calories: true, protein: true, carbs: true, fat: true },
      }),
      this.prisma.meal.findMany({
        where: { date: { gte: window.start, lte: window.end } },
        select: { userId: true },
        distinct: ['userId'],
      }),
      this.distinctActiveUserCount(gte, lt),
      this.prisma.aiRequestLog.count({ where: { createdAt: { gte, lt } } }),
      this.prisma.aiRequestLog.count({
        where: { createdAt: { gte, lt }, status: 'SUCCESS' },
      }),
      this.prisma.aiRequestLog.aggregate({
        where: { createdAt: { gte, lt } },
        _avg: { responseTimeMs: true },
      }),
      this.prisma.chatMessage.count({
        where: { role: 'USER', createdAt: { gte, lt } },
      }),
      this.prisma.aiRequestLog.count({
        where: { endpoint: 'RECOMMENDATION', createdAt: { gte, lt } },
      }),
    ]);

    const registrationMap = new Map<string, number>();
    for (const row of registrationRows)
      registrationMap.set(formatDateOnly(row.day), Number(row.count));
    const registrations = eachDate(window).map((date) => ({
      date,
      value: registrationMap.get(date) ?? 0,
    }));

    const inactiveUsers = Math.max(totalUsers - mau, 0);
    const mealsPerUserDenominator = rangeMealUsers.length || 1;

    return {
      userAnalytics: {
        dau,
        wau,
        mau,
        registrations,
        retention: { day1, day7, day30 },
        inactiveUsers,
      },
      nutritionAnalytics: {
        avgCalories: Math.round(rangeMealAgg._avg.calories ?? 0),
        avgProtein: Math.round((rangeMealAgg._avg.protein ?? 0) * 10) / 10,
        avgCarbs: Math.round((rangeMealAgg._avg.carbs ?? 0) * 10) / 10,
        avgFat: Math.round((rangeMealAgg._avg.fat ?? 0) * 10) / 10,
        avgMealsPerUser:
          Math.round((rangeMealAgg._count / mealsPerUserDenominator) * 10) / 10,
      },
      aiAnalytics: {
        requests: rangeAiTotal,
        successRatePct:
          rangeAiTotal > 0
            ? Math.round((rangeAiSuccess / rangeAiTotal) * 1000) / 10
            : 0,
        errors: rangeAiTotal - rangeAiSuccess,
        avgResponseTimeMs: Math.round(rangeAiAvg._avg.responseTimeMs ?? 0),
      },
      engagement: {
        mealsPerActiveUser: activeUsersInRange
          ? Math.round((rangeMealAgg._count / activeUsersInRange) * 10) / 10
          : 0,
        aiMessagesPerActiveUser: activeUsersInRange
          ? Math.round((rangeChatMessages / activeUsersInRange) * 10) / 10
          : 0,
        recommendationUsageRatePct: activeUsersInRange
          ? Math.round(
              (rangeRecommendationRequests / activeUsersInRange) * 1000,
            ) / 10
          : 0,
      },
    };
  }
}
