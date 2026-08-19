import { aggregateMuscleStats, RawSetRow } from './muscle-aggregation.util';

const TODAY = new Date('2026-08-19T00:00:00.000Z');

function daysAgo(n: number): Date {
  return new Date(TODAY.getTime() - n * 24 * 60 * 60 * 1000);
}

const BENCH_MUSCLES = [
  { muscle: 'CHEST' as const, weight: 1.0 },
  { muscle: 'TRICEPS' as const, weight: 0.4 },
  { muscle: 'FRONT_DELTS' as const, weight: 0.3 },
];

const ROWS: RawSetRow[] = [
  { weight: 100, weightUnit: 'KG', reps: 5, workoutId: 'w1', workoutDate: daysAgo(0), primaryMuscle: 'CHEST', muscles: BENCH_MUSCLES },
  { weight: 90, weightUnit: 'KG', reps: 5, workoutId: 'w2', workoutDate: daysAgo(8), primaryMuscle: 'CHEST', muscles: BENCH_MUSCLES },
  { weight: 80, weightUnit: 'KG', reps: 5, workoutId: 'w3', workoutDate: daysAgo(30), primaryMuscle: 'CHEST', muscles: BENCH_MUSCLES },
];

describe('muscle-aggregation.util', () => {
  it('computes CHEST (primary muscle) aggregates correctly', () => {
    const result = aggregateMuscleStats(ROWS, TODAY);
    const chest = result.CHEST;

    expect(chest.thisWeekVolume).toBe(500); // 100kg x 5 x 1.0
    expect(chest.lastWeekVolume).toBe(450); // 90kg x 5 x 1.0
    expect(chest.weeklyVolumeAvg).toBe(237.5); // (500+450+0+0)/4
    expect(chest.sessionsLast4Weeks).toBe(2); // w1 (week0) + w2 (week1); w3 is week4, outside last-4
    expect(chest.distinctTrainingWeeksLast8).toBe(3); // weeks 0, 1, 4
    expect(chest.daysSinceLastTrained).toBe(0);
    expect(chest.sessionsCount).toBe(3);
    expect(chest.weeklySets).toBe(1);
    expect(chest.lastTrainedAt).toEqual(TODAY);
  });

  it('computes est1RM using only the primary-muscle exercise, for the primary muscle', () => {
    const result = aggregateMuscleStats(ROWS, TODAY);
    const chest = result.CHEST;

    // best of week0 (100kg x5 -> ~116.7) and week1 (90kg x5 -> 105.0)
    expect(chest.currentEst1RM).toBeCloseTo(116.7, 1);
    // best of week3 (none) and week4 (80kg x5 -> ~93.3)
    expect(chest.est1RMFourWeeksAgo).toBeCloseTo(93.3, 1);
  });

  it('attributes secondary-muscle volume by the ExerciseMuscle weight, but never computes 1RM for a non-primary muscle', () => {
    const result = aggregateMuscleStats(ROWS, TODAY);
    const triceps = result.TRICEPS;

    expect(triceps.thisWeekVolume).toBe(200); // 500 * 0.4
    expect(triceps.lastWeekVolume).toBe(180); // 450 * 0.4
    expect(triceps.currentEst1RM).toBeNull();
    expect(triceps.est1RMFourWeeksAgo).toBeNull();
  });

  it('returns the never-trained default (sentinel 999 days, null lastTrainedAt) for an untouched muscle', () => {
    const result = aggregateMuscleStats(ROWS, TODAY);
    const glutes = result.GLUTES;

    expect(glutes.daysSinceLastTrained).toBe(999);
    expect(glutes.lastTrainedAt).toBeNull();
    expect(glutes.sessionsCount).toBe(0);
    expect(glutes.thisWeekVolume).toBe(0);
  });

  it('ignores rows outside the 8-week window even if the caller forgot to filter them', () => {
    const withStaleRow: RawSetRow[] = [
      ...ROWS,
      { weight: 999, weightUnit: 'KG', reps: 1, workoutId: 'w-old', workoutDate: daysAgo(90), primaryMuscle: 'CHEST', muscles: BENCH_MUSCLES },
    ];
    const result = aggregateMuscleStats(withStaleRow, TODAY);
    expect(result.CHEST.sessionsCount).toBe(3); // unchanged — the 90-day-old row is dropped
  });

  it('counts a bodyweight set (no weight) toward session/frequency stats but not toward volume or 1RM', () => {
    const rows: RawSetRow[] = [
      { weight: null, weightUnit: 'KG', reps: 20, workoutId: 'w-abs', workoutDate: daysAgo(0), primaryMuscle: 'ABS', muscles: [{ muscle: 'ABS', weight: 1.0 }] },
    ];
    const result = aggregateMuscleStats(rows, TODAY);
    expect(result.ABS.thisWeekVolume).toBe(0);
    expect(result.ABS.currentEst1RM).toBeNull();
    expect(result.ABS.sessionsCount).toBe(1);
    expect(result.ABS.daysSinceLastTrained).toBe(0);
  });
});
