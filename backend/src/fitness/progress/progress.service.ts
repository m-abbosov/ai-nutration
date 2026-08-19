import { Injectable } from '@nestjs/common';
import { MuscleCode, MuscleProgressSnapshot, MuscleRegion } from '@prisma/client';
import { addDays, todayDateOnly } from '../../common/date.util';
import { PrismaService } from '../../database/prisma.service';
import { MuscleDetailDto, MuscleProgressDto } from './dto/muscle-progress-response.dto';
import { aggregateMuscleStats, MuscleAggregate, RawSetRow } from './lib/muscle-aggregation.util';
import { calculateMuscleProgressScore } from './lib/muscle-score.util';
import { MUSCLE_VOLUME_TARGET_KG } from './lib/muscle-volume-targets';

const ALL_MUSCLES = Object.values(MuscleCode);
const AGGREGATION_WINDOW_DAYS = 55; // 8 weeks back, inclusive of today

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private async fetchRawRows(userId: string, today: Date): Promise<RawSetRow[]> {
    const windowStart = addDays(today, -AGGREGATION_WINDOW_DAYS);
    const sets = await this.prisma.exerciseSet.findMany({
      where: { completed: true, workoutExercise: { workout: { userId, date: { gte: windowStart } } } },
      select: {
        weight: true,
        weightUnit: true,
        reps: true,
        workoutExercise: {
          select: {
            workout: { select: { id: true, date: true } },
            exercise: { select: { primaryMuscle: true, muscles: { select: { muscle: true, weight: true } } } },
          },
        },
      },
    });
    return sets.map((s) => ({
      weight: s.weight,
      weightUnit: s.weightUnit,
      reps: s.reps,
      workoutId: s.workoutExercise.workout.id,
      workoutDate: s.workoutExercise.workout.date,
      primaryMuscle: s.workoutExercise.exercise.primaryMuscle,
      muscles: s.workoutExercise.exercise.muscles,
    }));
  }

  private scoreFor(muscle: MuscleCode, agg: MuscleAggregate): number {
    return calculateMuscleProgressScore({
      sessionsLast4Weeks: agg.sessionsLast4Weeks,
      weeklyVolumeAvg: agg.weeklyVolumeAvg,
      muscleVolumeTarget: MUSCLE_VOLUME_TARGET_KG[muscle],
      thisWeekVolume: agg.thisWeekVolume,
      lastWeekVolume: agg.lastWeekVolume,
      currentEst1RM: agg.currentEst1RM,
      est1RMFourWeeksAgo: agg.est1RMFourWeeksAgo,
      daysSinceLastTrained: agg.daysSinceLastTrained,
      distinctTrainingWeeksLast8: agg.distinctTrainingWeeksLast8,
    });
  }

  /** Recomputes every muscle's aggregate from raw workout/set data (the sole
   * source of truth) and upserts today's snapshot row for each — the cache
   * this endpoint reads on subsequent calls the same day. Bounded to an
   * 8-week, indexed window, so this is cheap even though it touches all 18
   * muscles at once. */
  private async computeAndCache(userId: string, today: Date): Promise<Record<MuscleCode, MuscleAggregate>> {
    const rows = await this.fetchRawRows(userId, today);
    const aggregates = aggregateMuscleStats(rows, today);

    await Promise.all(
      ALL_MUSCLES.map((muscle) => {
        const agg = aggregates[muscle];
        const progressScore = this.scoreFor(muscle, agg);
        return this.prisma.muscleProgressSnapshot.upsert({
          where: { userId_muscle_snapshotDate: { userId, muscle, snapshotDate: today } },
          update: {
            progressScore,
            weeklySets: agg.weeklySets,
            weeklyVolume: agg.thisWeekVolume,
            sessionsCount: agg.sessionsCount,
            lastTrainedAt: agg.lastTrainedAt,
            computedAt: new Date(),
          },
          create: {
            userId,
            muscle,
            snapshotDate: today,
            progressScore,
            weeklySets: agg.weeklySets,
            weeklyVolume: agg.thisWeekVolume,
            sessionsCount: agg.sessionsCount,
            lastTrainedAt: agg.lastTrainedAt,
          },
        });
      }),
    );

    return aggregates;
  }

  private snapshotToDto(snapshot: MuscleProgressSnapshot, region: MuscleRegion): MuscleProgressDto {
    return {
      muscle: snapshot.muscle,
      region,
      progressScore: snapshot.progressScore,
      weeklySets: snapshot.weeklySets,
      weeklyVolume: snapshot.weeklyVolume,
      sessionsCount: snapshot.sessionsCount,
      lastTrainedAt: snapshot.lastTrainedAt?.toISOString() ?? null,
    };
  }

  async getAllProgress(userId: string): Promise<MuscleProgressDto[]> {
    const today = todayDateOnly();
    const [existing, muscleGroups] = await Promise.all([
      this.prisma.muscleProgressSnapshot.findMany({ where: { userId, snapshotDate: today } }),
      this.prisma.muscleGroup.findMany(),
    ]);
    const regionByMuscle = new Map(muscleGroups.map((m) => [m.code, m.region]));

    if (existing.length === ALL_MUSCLES.length) {
      return existing.map((s) => this.snapshotToDto(s, regionByMuscle.get(s.muscle)!));
    }

    const aggregates = await this.computeAndCache(userId, today);
    return ALL_MUSCLES.map((muscle) => ({
      muscle,
      region: regionByMuscle.get(muscle)!,
      progressScore: this.scoreFor(muscle, aggregates[muscle]),
      weeklySets: aggregates[muscle].weeklySets,
      weeklyVolume: aggregates[muscle].thisWeekVolume,
      sessionsCount: aggregates[muscle].sessionsCount,
      lastTrainedAt: aggregates[muscle].lastTrainedAt?.toISOString() ?? null,
    }));
  }

  async getMuscleDetail(userId: string, muscle: MuscleCode): Promise<MuscleDetailDto> {
    const today = todayDateOnly();
    const [rows, muscleGroup] = await Promise.all([
      this.fetchRawRows(userId, today),
      this.prisma.muscleGroup.findUniqueOrThrow({ where: { code: muscle } }),
    ]);
    const agg = aggregateMuscleStats(rows, today)[muscle];

    const volumeChangePct =
      agg.lastWeekVolume > 0 ? Math.round(((agg.thisWeekVolume - agg.lastWeekVolume) / agg.lastWeekVolume) * 1000) / 10 : null;
    const strengthChangePct =
      agg.currentEst1RM !== null && agg.est1RMFourWeeksAgo
        ? Math.round(((agg.currentEst1RM - agg.est1RMFourWeeksAgo) / agg.est1RMFourWeeksAgo) * 1000) / 10
        : null;

    return {
      muscle,
      region: muscleGroup.region,
      progressScore: this.scoreFor(muscle, agg),
      weeklySets: agg.weeklySets,
      weeklyVolume: agg.thisWeekVolume,
      sessionsCount: agg.sessionsCount,
      lastTrainedAt: agg.lastTrainedAt?.toISOString() ?? null,
      thisWeekVolume: agg.thisWeekVolume,
      lastWeekVolume: agg.lastWeekVolume,
      volumeChangePct,
      strengthChangePct,
    };
  }

  /** Used by MuscleBalanceService (fitness-analytics) — the same 8-week
   * aggregation as everything else here, reduced to a rough "last 4 weeks
   * total volume per muscle" figure for the push/pull/legs/core split. */
  async getLast4WeeksVolumeByMuscle(userId: string): Promise<Record<MuscleCode, number>> {
    const today = todayDateOnly();
    const rows = await this.fetchRawRows(userId, today);
    const aggregates = aggregateMuscleStats(rows, today);
    const result = {} as Record<MuscleCode, number>;
    for (const muscle of ALL_MUSCLES) {
      result[muscle] = Math.round(aggregates[muscle].weeklyVolumeAvg * 4 * 10) / 10;
    }
    return result;
  }

  /** Called by workout.service.ts right after a workout is saved — deletes
   * (rather than recomputes) today's snapshot rows for just the muscles that
   * workout touched, so the next GET /fitness/progress recomputes only what
   * actually changed instead of all 18 muscles on every save. */
  async invalidateSnapshotsForMuscles(userId: string, muscles: MuscleCode[]): Promise<void> {
    if (muscles.length === 0) return;
    const today = todayDateOnly();
    await this.prisma.muscleProgressSnapshot.deleteMany({
      where: { userId, snapshotDate: today, muscle: { in: [...new Set(muscles)] } },
    });
  }
}
