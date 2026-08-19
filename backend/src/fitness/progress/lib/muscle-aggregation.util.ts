import { MuscleCode, WeightUnit } from '@prisma/client';
import { estimateOneRepMax } from '../../lib/estimate-1rm.util';
import { toKg } from '../../workout/lib/volume.util';

export interface RawSetRow {
  weight: number | null;
  weightUnit: WeightUnit;
  reps: number | null;
  workoutId: string;
  workoutDate: Date;
  primaryMuscle: MuscleCode;
  // All muscles this set's exercise trains (primary + secondary), with the
  // volume-attribution weight from ExerciseMuscle (e.g. secondary ~0.3).
  muscles: { muscle: MuscleCode; weight: number }[];
}

export interface MuscleAggregate {
  sessionsLast4Weeks: number;
  weeklyVolumeAvg: number;
  thisWeekVolume: number;
  lastWeekVolume: number;
  currentEst1RM: number | null;
  est1RMFourWeeksAgo: number | null;
  daysSinceLastTrained: number;
  distinctTrainingWeeksLast8: number;
  weeklySets: number;
  sessionsCount: number;
  lastTrainedAt: Date | null;
}

const NEVER_TRAINED_SENTINEL_DAYS = 999;

function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
}

function emptyAggregate(): MuscleAggregate {
  return {
    sessionsLast4Weeks: 0,
    weeklyVolumeAvg: 0,
    thisWeekVolume: 0,
    lastWeekVolume: 0,
    currentEst1RM: null,
    est1RMFourWeeksAgo: null,
    daysSinceLastTrained: NEVER_TRAINED_SENTINEL_DAYS,
    distinctTrainingWeeksLast8: 0,
    weeklySets: 0,
    sessionsCount: 0,
    lastTrainedAt: null,
  };
}

/**
 * Buckets raw set rows (already scoped to an 8-week window by the caller's
 * DB query) into a per-muscle aggregate that muscle-score.util.ts's pure
 * scoring function consumes. All "week N" indexing is relative to `today`:
 * week 0 = the last 7 days, week 1 = the 7 days before that, etc.
 */
export function aggregateMuscleStats(rows: RawSetRow[], today: Date): Record<MuscleCode, MuscleAggregate> {
  const result = {} as Record<MuscleCode, MuscleAggregate>;
  for (const muscle of Object.values(MuscleCode)) {
    result[muscle] = emptyAggregate();
  }

  const weeklyVolume = new Map<MuscleCode, Map<number, number>>();
  const weeklySessions = new Map<MuscleCode, Map<number, Set<string>>>();
  const weeklySetCount = new Map<MuscleCode, Map<number, number>>();
  const minDaysAgo = new Map<MuscleCode, number>();
  const weeklyEst1RM = new Map<MuscleCode, Map<number, number>>();

  for (const row of rows) {
    const daysAgo = daysBetween(today, row.workoutDate);
    const weekIndex = Math.floor(daysAgo / 7);
    if (weekIndex < 0 || weekIndex > 7) continue;

    const hasWeight = row.weight !== null;
    const hasReps = row.reps !== null;
    const setVolumeKg = hasWeight && hasReps ? toKg(row.weight as number, row.weightUnit) * (row.reps as number) : 0;

    for (const { muscle, weight: attribution } of row.muscles) {
      if (!weeklyVolume.has(muscle)) weeklyVolume.set(muscle, new Map());
      if (!weeklySessions.has(muscle)) weeklySessions.set(muscle, new Map());
      if (!weeklySetCount.has(muscle)) weeklySetCount.set(muscle, new Map());

      const volumeMap = weeklyVolume.get(muscle)!;
      volumeMap.set(weekIndex, (volumeMap.get(weekIndex) ?? 0) + setVolumeKg * attribution);

      const sessionMap = weeklySessions.get(muscle)!;
      if (!sessionMap.has(weekIndex)) sessionMap.set(weekIndex, new Set());
      sessionMap.get(weekIndex)!.add(row.workoutId);

      const setCountMap = weeklySetCount.get(muscle)!;
      setCountMap.set(weekIndex, (setCountMap.get(weekIndex) ?? 0) + 1);

      const prevMin = minDaysAgo.get(muscle);
      if (prevMin === undefined || daysAgo < prevMin) minDaysAgo.set(muscle, daysAgo);
    }

    if (hasWeight && hasReps && row.primaryMuscle) {
      const est1rm = estimateOneRepMax(toKg(row.weight as number, row.weightUnit), row.reps as number);
      if (!weeklyEst1RM.has(row.primaryMuscle)) weeklyEst1RM.set(row.primaryMuscle, new Map());
      const map = weeklyEst1RM.get(row.primaryMuscle)!;
      map.set(weekIndex, Math.max(map.get(weekIndex) ?? 0, est1rm));
    }
  }

  for (const muscle of Object.values(MuscleCode)) {
    const volumeMap = weeklyVolume.get(muscle);
    const sessionMap = weeklySessions.get(muscle);
    const setCountMap = weeklySetCount.get(muscle);
    const est1rmMap = weeklyEst1RM.get(muscle);
    if (!volumeMap && !sessionMap) continue;

    let last4WeeksVolume = 0;
    const last4WeeksSessions = new Set<string>();
    const allSessions = new Set<string>();
    let distinctTrainingWeeks = 0;

    for (let week = 0; week <= 7; week++) {
      const vol = volumeMap?.get(week) ?? 0;
      const sessions = sessionMap?.get(week);
      if (sessions && sessions.size > 0) {
        distinctTrainingWeeks += 1;
        sessions.forEach((id) => allSessions.add(id));
        if (week <= 3) sessions.forEach((id) => last4WeeksSessions.add(id));
      }
      if (week <= 3) last4WeeksVolume += vol;
    }

    const currentEst1RM = Math.max(est1rmMap?.get(0) ?? 0, est1rmMap?.get(1) ?? 0) || null;
    const baselineEst1RM = Math.max(est1rmMap?.get(3) ?? 0, est1rmMap?.get(4) ?? 0) || null;

    const daysSinceLastTrained = minDaysAgo.get(muscle) ?? NEVER_TRAINED_SENTINEL_DAYS;

    result[muscle] = {
      sessionsLast4Weeks: last4WeeksSessions.size,
      weeklyVolumeAvg: Math.round((last4WeeksVolume / 4) * 10) / 10,
      thisWeekVolume: Math.round((volumeMap?.get(0) ?? 0) * 10) / 10,
      lastWeekVolume: Math.round((volumeMap?.get(1) ?? 0) * 10) / 10,
      currentEst1RM,
      est1RMFourWeeksAgo: baselineEst1RM,
      daysSinceLastTrained,
      distinctTrainingWeeksLast8: distinctTrainingWeeks,
      weeklySets: setCountMap?.get(0) ?? 0,
      sessionsCount: allSessions.size,
      lastTrainedAt:
        daysSinceLastTrained === NEVER_TRAINED_SENTINEL_DAYS
          ? null
          : new Date(today.getTime() - daysSinceLastTrained * 24 * 60 * 60 * 1000),
    };
  }

  return result;
}
