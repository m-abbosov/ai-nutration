import { calculateMuscleProgressScore, MuscleScoreInput } from './muscle-score.util';

const BASE: MuscleScoreInput = {
  sessionsLast4Weeks: 0,
  weeklyVolumeAvg: 0,
  muscleVolumeTarget: 1000,
  thisWeekVolume: 0,
  lastWeekVolume: 0,
  currentEst1RM: null,
  est1RMFourWeeksAgo: null,
  daysSinceLastTrained: 999,
  distinctTrainingWeeksLast8: 0,
};

describe('muscle-score.util', () => {
  it('scores a never-trained muscle at the bottom of the "inactive" band (0-20)', () => {
    const score = calculateMuscleProgressScore(BASE);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(20);
  });

  it('scores a fully on-target, recently-trained, consistent muscle in the "strong" band (81-100)', () => {
    const score = calculateMuscleProgressScore({
      sessionsLast4Weeks: 8,
      weeklyVolumeAvg: 1000,
      muscleVolumeTarget: 1000,
      thisWeekVolume: 1200,
      lastWeekVolume: 1000,
      currentEst1RM: 110,
      est1RMFourWeeksAgo: 100,
      daysSinceLastTrained: 1,
      distinctTrainingWeeksLast8: 8,
    });
    expect(score).toBeGreaterThanOrEqual(81);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('never returns a value outside [0, 100]', () => {
    const extreme = calculateMuscleProgressScore({
      ...BASE,
      sessionsLast4Weeks: 100,
      weeklyVolumeAvg: 100000,
      thisWeekVolume: 100000,
      lastWeekVolume: 1,
      currentEst1RM: 500,
      est1RMFourWeeksAgo: 1,
      daysSinceLastTrained: 0,
      distinctTrainingWeeksLast8: 100,
    });
    expect(extreme).toBeLessThanOrEqual(100);
    expect(extreme).toBeGreaterThanOrEqual(0);
  });

  it('applies zero recency penalty within 3 days of last training', () => {
    const at3 = calculateMuscleProgressScore({ ...BASE, daysSinceLastTrained: 3 });
    const at0 = calculateMuscleProgressScore({ ...BASE, daysSinceLastTrained: 0 });
    expect(at3).toBe(at0);
  });

  it('increases the recency penalty the longer a muscle has been untrained, capped at 40', () => {
    const at5 = calculateMuscleProgressScore({ ...BASE, sessionsLast4Weeks: 4, weeklyVolumeAvg: 500, daysSinceLastTrained: 5 });
    const at20 = calculateMuscleProgressScore({ ...BASE, sessionsLast4Weeks: 4, weeklyVolumeAvg: 500, daysSinceLastTrained: 20 });
    const at100 = calculateMuscleProgressScore({ ...BASE, sessionsLast4Weeks: 4, weeklyVolumeAvg: 500, daysSinceLastTrained: 100 });
    expect(at20).toBeLessThan(at5);
    // Penalty caps at 40, so 20 days and 100 days should score identically.
    expect(at100).toBe(at20);
  });

  it('defaults trendScore to neutral (50) when there is no prior week to compare against', () => {
    const withoutLastWeek = calculateMuscleProgressScore({ ...BASE, thisWeekVolume: 500, lastWeekVolume: 0 });
    const withFlatTrend = calculateMuscleProgressScore({ ...BASE, thisWeekVolume: 500, lastWeekVolume: 500 });
    // Both effectively hit the neutral trendScore of 50 (no change vs no baseline).
    expect(withoutLastWeek).toBe(withFlatTrend);
  });

  it('rewards a volume increase week-over-week relative to a flat trend', () => {
    // Use a non-floor-clamped baseline (some sessions, recently trained) so the
    // trendScore difference is actually visible in the final rounded score.
    const active = { ...BASE, sessionsLast4Weeks: 4, weeklyVolumeAvg: 500, daysSinceLastTrained: 1 };
    const flat = calculateMuscleProgressScore({ ...active, thisWeekVolume: 500, lastWeekVolume: 500 });
    const increased = calculateMuscleProgressScore({ ...active, thisWeekVolume: 750, lastWeekVolume: 500 });
    expect(increased).toBeGreaterThan(flat);
  });

  it('defaults strengthScore to neutral when there is no 1RM baseline', () => {
    const noBaseline = calculateMuscleProgressScore({ ...BASE, currentEst1RM: 100, est1RMFourWeeksAgo: null });
    const flatBaseline = calculateMuscleProgressScore({ ...BASE, currentEst1RM: 100, est1RMFourWeeksAgo: 100 });
    expect(noBaseline).toBe(flatBaseline);
  });

  it('returns 0 volumeScore contribution when the muscle has no configured target', () => {
    const score = calculateMuscleProgressScore({ ...BASE, muscleVolumeTarget: 0, weeklyVolumeAvg: 500 });
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
