import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { formatDateOnly, todayDateOnly, addDays } from '../../common/date.util';
import { PrismaService } from '../../database/prisma.service';
import {
  currentWindow,
  eachDate,
  kpi,
  parseRange,
  Range,
  windowToTimestamps,
} from '../common/range.util';
import { AdminDashboardDto } from './dto/admin-dashboard.dto';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async distinctActiveUserIds(dayStart: Date): Promise<Set<string>> {
    const dayEnd = addDays(dayStart, 1);
    const [mealUsers, convoUsers] = await Promise.all([
      this.prisma.meal.findMany({
        where: { date: dayStart },
        select: { userId: true },
        distinct: ['userId'],
      }),
      this.prisma.conversation.findMany({
        where: { updatedAt: { gte: dayStart, lt: dayEnd } },
        select: { userId: true },
        distinct: ['userId'],
      }),
    ]);
    return new Set([
      ...mealUsers.map((m) => m.userId),
      ...convoUsers.map((c) => c.userId),
    ]);
  }

  async getDashboard(
    rangeParam: string | undefined,
  ): Promise<AdminDashboardDto> {
    const range: Range = parseRange(rangeParam);
    const window = currentWindow(range);
    const windowTs = windowToTimestamps(window);

    const today = todayDateOnly();
    const yesterday = addDays(today, -1);
    const todayTs = { gte: today, lt: addDays(today, 1) };
    const yesterdayTs = { gte: yesterday, lt: today };
    const last7Ts = { gte: addDays(today, -6), lt: addDays(today, 1) };
    const last30Ts = { gte: addDays(today, -29), lt: addDays(today, 1) };

    const [
      totalUsersNow,
      totalUsersAtWindowStart,
      newUsersToday,
      newUsersYesterday,
      activeToday,
      activeYesterday,
      totalMealsNow,
      totalMealsAtWindowStart,
      aiRequestsToday,
      aiErrorsToday,
      aiRequestsYesterday,
      aiErrorsYesterday,
      growthRows,
      mealAggTotal,
      mealAggToday,
      mealAggWeek,
      mealAggMonth,
      mealPerDayRows,
      mealByType,
      aiRequestsWeek,
      aiRequestsMonth,
      aiRangeSuccess,
      aiRangeFailure,
      aiRangeAvg,
      aiRangeTokens,
      goalGroups,
      langGroups,
      recentUsers,
      recentMeals,
      recentAi,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { lt: windowTs.gte } } }),
      this.prisma.user.count({ where: { createdAt: todayTs } }),
      this.prisma.user.count({ where: { createdAt: yesterdayTs } }),
      this.distinctActiveUserIds(today),
      this.distinctActiveUserIds(yesterday),
      this.prisma.meal.count(),
      this.prisma.meal.count({ where: { createdAt: { lt: windowTs.gte } } }),
      this.prisma.aiRequestLog.count({ where: { createdAt: todayTs } }),
      this.prisma.aiRequestLog.count({
        where: { createdAt: todayTs, status: 'ERROR' },
      }),
      this.prisma.aiRequestLog.count({ where: { createdAt: yesterdayTs } }),
      this.prisma.aiRequestLog.count({
        where: { createdAt: yesterdayTs, status: 'ERROR' },
      }),
      this.prisma.$queryRaw<
        { day: Date; newUsers: bigint; activeUsers: bigint }[]
      >(Prisma.sql`
        WITH days AS (
          SELECT generate_series(${window.start}::date, ${window.end}::date, interval '1 day')::date AS day
        ),
        new_users AS (
          SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*) AS cnt
          FROM users
          WHERE "createdAt" >= ${window.start}::date AND "createdAt" < (${window.end}::date + interval '1 day')
          GROUP BY 1
        ),
        active AS (
          SELECT day, COUNT(DISTINCT user_id) AS cnt FROM (
            SELECT date AS day, "userId" AS user_id FROM meals
            WHERE date >= ${window.start}::date AND date <= ${window.end}::date
            UNION
            SELECT date_trunc('day', "updatedAt")::date AS day, "userId" AS user_id FROM conversations
            WHERE "updatedAt" >= ${window.start}::date AND "updatedAt" < (${window.end}::date + interval '1 day')
          ) x GROUP BY day
        )
        SELECT days.day, COALESCE(new_users.cnt, 0) AS "newUsers", COALESCE(active.cnt, 0) AS "activeUsers"
        FROM days
        LEFT JOIN new_users ON new_users.day = days.day
        LEFT JOIN active ON active.day = days.day
        ORDER BY days.day
      `),
      this.prisma.meal.aggregate({ _count: true }),
      this.prisma.meal.count({ where: { date: today } }),
      this.prisma.meal.count({
        where: { date: { gte: addDays(today, -6), lte: today } },
      }),
      this.prisma.meal.count({
        where: { date: { gte: addDays(today, -29), lte: today } },
      }),
      this.prisma.meal.groupBy({
        by: ['date'],
        where: { date: { gte: window.start, lte: window.end } },
        _count: true,
      }),
      this.prisma.meal.groupBy({
        by: ['mealType'],
        where: { date: { gte: window.start, lte: window.end } },
        _count: true,
      }),
      this.prisma.aiRequestLog.count({ where: { createdAt: last7Ts } }),
      this.prisma.aiRequestLog.count({ where: { createdAt: last30Ts } }),
      this.prisma.aiRequestLog.count({
        where: { createdAt: windowTs, status: 'SUCCESS' },
      }),
      this.prisma.aiRequestLog.count({
        where: { createdAt: windowTs, status: 'ERROR' },
      }),
      this.prisma.aiRequestLog.aggregate({
        where: { createdAt: windowTs },
        _avg: { responseTimeMs: true },
      }),
      this.prisma.aiRequestLog.aggregate({
        where: { createdAt: windowTs },
        _sum: { promptTokens: true, completionTokens: true, totalTokens: true },
      }),
      this.prisma.user.groupBy({
        by: ['goal'],
        where: { goal: { not: null } },
        _count: true,
      }),
      this.prisma.user.groupBy({ by: ['language'], _count: true }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, name: true, createdAt: true, googleId: true },
      }),
      this.prisma.meal.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          name: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      this.prisma.aiRequestLog.findMany({
        where: {
          OR: [
            { status: 'ERROR' },
            { endpoint: 'RECOMMENDATION', status: 'SUCCESS' },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          status: true,
          errorReason: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
    ]);

    const todayErrorRate =
      aiRequestsToday > 0 ? (aiErrorsToday / aiRequestsToday) * 100 : 0;
    const yesterdayErrorRate =
      aiRequestsYesterday > 0
        ? (aiErrorsYesterday / aiRequestsYesterday) * 100
        : 0;

    const userGrowth = growthRows.map((row) => ({
      date: formatDateOnly(row.day),
      newUsers: Number(row.newUsers),
      activeUsers: Number(row.activeUsers),
    }));

    const mealPerDayMap = new Map<string, number>();
    for (const row of mealPerDayRows)
      mealPerDayMap.set(formatDateOnly(row.date), row._count);
    const perDay = eachDate(window).map((date) => ({
      date,
      value: mealPerDayMap.get(date) ?? 0,
    }));

    const tokenUsage =
      aiRangeTokens._sum.promptTokens == null &&
      aiRangeTokens._sum.completionTokens == null &&
      aiRangeTokens._sum.totalTokens == null
        ? null
        : {
            promptTokens: aiRangeTokens._sum.promptTokens ?? 0,
            completionTokens: aiRangeTokens._sum.completionTokens ?? 0,
            totalTokens: aiRangeTokens._sum.totalTokens ?? 0,
          };

    const totalWithGoal = goalGroups.reduce((sum, g) => sum + g._count, 0);
    const userGoals = goalGroups.map((g) => ({
      goal: g.goal!,
      count: g._count,
      percent: totalWithGoal
        ? Math.round((g._count / totalWithGoal) * 1000) / 10
        : 0,
    }));

    const totalForLang = langGroups.reduce((sum, g) => sum + g._count, 0);
    const languageDistribution = langGroups.map((g) => ({
      language: g.language,
      count: g._count,
      percent: totalForLang
        ? Math.round((g._count / totalForLang) * 1000) / 10
        : 0,
    }));

    type ActivityEvent = {
      id: string;
      type: AdminDashboardDto['recentActivity'][number]['type'];
      label: string;
      userName: string | null;
      createdAt: Date;
    };
    const events: ActivityEvent[] = [
      ...recentUsers.map((u): ActivityEvent => ({
        id: `user-${u.id}`,
        type: 'USER_REGISTERED',
        label: `New user registered via ${u.googleId ? 'Google' : 'Telegram'}`,
        userName: u.name,
        createdAt: u.createdAt,
      })),
      ...recentMeals.map((m): ActivityEvent => ({
        id: `meal-${m.id}`,
        type: 'MEAL_LOGGED',
        label: `Logged ${m.name}`,
        userName: m.user.name,
        createdAt: m.createdAt,
      })),
      ...recentAi.map((a): ActivityEvent => ({
        id: `ai-${a.id}`,
        type: a.status === 'ERROR' ? 'AI_REQUEST_FAILED' : 'AI_RECOMMENDATION',
        label:
          a.status === 'ERROR'
            ? `AI request failed${a.errorReason ? ` (${a.errorReason})` : ''}`
            : 'Received AI meal recommendations',
        userName: a.user?.name ?? null,
        createdAt: a.createdAt,
      })),
    ];
    const recentActivity = events
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20)
      .map((e) => ({ ...e, createdAt: e.createdAt.toISOString() }));

    return {
      kpis: {
        totalUsers: kpi(totalUsersNow, totalUsersAtWindowStart),
        activeUsersToday: kpi(activeToday.size, activeYesterday.size),
        newUsersToday: kpi(newUsersToday, newUsersYesterday),
        totalMeals: kpi(totalMealsNow, totalMealsAtWindowStart),
        aiRequestsToday: kpi(aiRequestsToday, aiRequestsYesterday),
        aiErrorRateToday: kpi(
          Math.round(todayErrorRate * 10) / 10,
          Math.round(yesterdayErrorRate * 10) / 10,
        ),
      },
      userGrowth,
      aiUsage: {
        requestsToday: aiRequestsToday,
        requestsThisWeek: aiRequestsWeek,
        requestsThisMonth: aiRequestsMonth,
        successCount: aiRangeSuccess,
        failureCount: aiRangeFailure,
        avgResponseTimeMs: Math.round(aiRangeAvg._avg.responseTimeMs ?? 0),
        tokenUsage,
      },
      mealActivity: {
        total: mealAggTotal._count,
        today: mealAggToday,
        thisWeek: mealAggWeek,
        thisMonth: mealAggMonth,
        perDay,
        byMealType: mealByType.map((row) => ({
          mealType: row.mealType,
          count: row._count,
        })),
      },
      userGoals,
      languageDistribution,
      recentActivity,
    };
  }
}
