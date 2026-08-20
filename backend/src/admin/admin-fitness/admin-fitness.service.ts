import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { addDays, formatDateOnly, todayDateOnly } from '../../common/date.util';
import { PrismaService } from '../../database/prisma.service';
import { currentWindow, eachDate, parseRange } from '../common/range.util';
import { AdminFitnessDto } from './dto/admin-fitness.dto';

@Injectable()
export class AdminFitnessService {
  constructor(private readonly prisma: PrismaService) {}

  async getFitness(rangeParam: string | undefined): Promise<AdminFitnessDto> {
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
      setsInRange,
      topExerciseRows,
      categoryRows,
      prCount,
    ] = await Promise.all([
      this.prisma.workout.count(),
      this.prisma.workout.count({ where: { date: today } }),
      this.prisma.workout.count({ where: { date: { gte: addDays(today, -6), lte: today } } }),
      this.prisma.workout.count({ where: { date: { gte: addDays(today, -29), lte: today } } }),
      this.prisma.workout.aggregate({
        where: { date: { gte: window.start, lte: window.end } },
        _count: true,
        _avg: { totalVolume: true, durationSec: true },
      }),
      this.prisma.workout.groupBy({
        by: ['date'],
        where: { date: { gte: window.start, lte: window.end } },
        _count: true,
      }),
      this.prisma.exerciseSet.count({
        where: { workoutExercise: { workout: { date: { gte: window.start, lte: window.end } } } },
      }),
      this.prisma.$queryRaw<{ slug: string; count: bigint }[]>(Prisma.sql`
        SELECT e.slug, COUNT(*) AS count
        FROM workout_exercises we
        JOIN workouts w ON w.id = we."workoutId"
        JOIN exercises e ON e.id = we."exerciseId"
        WHERE w.date >= ${window.start}::date AND w.date <= ${window.end}::date
        GROUP BY e.slug
        ORDER BY count DESC
        LIMIT 10
      `),
      this.prisma.$queryRaw<{ category: string; count: bigint }[]>(Prisma.sql`
        SELECT e.category::text AS category, COUNT(*) AS count
        FROM workout_exercises we
        JOIN workouts w ON w.id = we."workoutId"
        JOIN exercises e ON e.id = we."exerciseId"
        WHERE w.date >= ${window.start}::date AND w.date <= ${window.end}::date
        GROUP BY e.category
      `),
      this.prisma.personalRecord.count(),
    ]);

    const dailyMap = new Map<string, number>();
    for (const row of dailyRows) dailyMap.set(formatDateOnly(row.date), row._count);
    const dailyWorkouts = eachDate(window).map((date) => ({ date, value: dailyMap.get(date) ?? 0 }));

    const totalCategoryCount = categoryRows.reduce((sum, r) => sum + Number(r.count), 0);
    const workoutsInRange = rangeAgg._count || 1;

    return {
      totals: { total: totalAll, today: totalToday, thisWeek: totalWeek, thisMonth: totalMonth },
      averages: {
        volume: Math.round((rangeAgg._avg.totalVolume ?? 0) * 10) / 10,
        durationMin: rangeAgg._avg.durationSec ? Math.round(rangeAgg._avg.durationSec / 60) : 0,
        setsPerWorkout: Math.round((setsInRange / workoutsInRange) * 10) / 10,
      },
      dailyWorkouts,
      topExercises: topExerciseRows.map((r) => ({ slug: r.slug, count: Number(r.count) })),
      categoryDistribution: categoryRows.map((r) => ({
        category: r.category as AdminFitnessDto['categoryDistribution'][number]['category'],
        count: Number(r.count),
        percent: totalCategoryCount ? Math.round((Number(r.count) / totalCategoryCount) * 1000) / 10 : 0,
      })),
      personalRecordsCount: prCount,
    };
  }
}
