import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { addDays, formatDateOnly, todayDateOnly } from '../../common/date.util';
import { PrismaService } from '../../database/prisma.service';
import { currentWindow, eachDate, parseRange } from '../common/range.util';
import { AdminNutritionDto } from './dto/admin-nutrition.dto';

@Injectable()
export class AdminNutritionService {
  constructor(private readonly prisma: PrismaService) {}

  async getNutrition(
    rangeParam: string | undefined,
  ): Promise<AdminNutritionDto> {
    const range = parseRange(rangeParam);
    const window = currentWindow(range);
    const today = todayDateOnly();

    const [
      totalAll,
      totalToday,
      totalWeek,
      totalMonth,
      rangeAgg,
      dailyRows,
      caloriesBuckets,
      mealTypeGroups,
      topFoods,
    ] = await Promise.all([
      this.prisma.meal.count(),
      this.prisma.meal.count({ where: { date: today } }),
      this.prisma.meal.count({
        where: { date: { gte: addDays(today, -6), lte: today } },
      }),
      this.prisma.meal.count({
        where: { date: { gte: addDays(today, -29), lte: today } },
      }),
      this.prisma.meal.aggregate({
        where: { date: { gte: window.start, lte: window.end } },
        _count: true,
        _avg: { calories: true, protein: true, carbs: true, fat: true },
      }),
      this.prisma.meal.groupBy({
        by: ['date'],
        where: { date: { gte: window.start, lte: window.end } },
        _count: true,
      }),
      this.prisma.$queryRaw<
        { bucketStart: number; count: bigint }[]
      >(Prisma.sql`
        SELECT (FLOOR(calories / 300) * 300)::int AS "bucketStart", COUNT(*) AS count
        FROM meals
        WHERE date >= ${window.start}::date AND date <= ${window.end}::date
        GROUP BY "bucketStart"
        ORDER BY "bucketStart"
      `),
      this.prisma.meal.groupBy({
        by: ['mealType'],
        where: { date: { gte: window.start, lte: window.end } },
        _count: true,
      }),
      this.prisma.$queryRaw<{ name: string; count: bigint }[]>(Prisma.sql`
        SELECT LOWER(TRIM(name)) AS name, COUNT(*) AS count
        FROM meals
        WHERE date >= ${window.start}::date AND date <= ${window.end}::date
        GROUP BY LOWER(TRIM(name))
        ORDER BY count DESC
        LIMIT 10
      `),
    ]);

    const dailyMap = new Map<string, number>();
    for (const row of dailyRows)
      dailyMap.set(formatDateOnly(row.date), row._count);
    const dailyMeals = eachDate(window).map((date) => ({
      date,
      value: dailyMap.get(date) ?? 0,
    }));

    const totalInRange = mealTypeGroups.reduce((sum, g) => sum + g._count, 0);

    return {
      totals: {
        total: totalAll,
        today: totalToday,
        thisWeek: totalWeek,
        thisMonth: totalMonth,
      },
      averages: {
        calories: Math.round(rangeAgg._avg.calories ?? 0),
        protein: Math.round((rangeAgg._avg.protein ?? 0) * 10) / 10,
        carbs: Math.round((rangeAgg._avg.carbs ?? 0) * 10) / 10,
        fat: Math.round((rangeAgg._avg.fat ?? 0) * 10) / 10,
      },
      dailyMeals,
      caloriesDistribution: caloriesBuckets.map((row) => ({
        bucket: `${row.bucketStart}-${row.bucketStart + 300}`,
        count: Number(row.count),
      })),
      macroDistribution: {
        protein: Math.round((rangeAgg._avg.protein ?? 0) * 10) / 10,
        carbs: Math.round((rangeAgg._avg.carbs ?? 0) * 10) / 10,
        fat: Math.round((rangeAgg._avg.fat ?? 0) * 10) / 10,
      },
      mealTypeDistribution: mealTypeGroups.map((g) => ({
        mealType: g.mealType,
        count: g._count,
        percent: totalInRange
          ? Math.round((g._count / totalInRange) * 1000) / 10
          : 0,
      })),
      topLoggedFoods: topFoods.map((row) => ({
        name: row.name,
        count: Number(row.count),
      })),
    };
  }
}
