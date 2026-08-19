function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface MuscleScoreInput {
  /** Number of distinct workout sessions touching this muscle in the last 4 weeks. */
  sessionsLast4Weeks: number;
  /** Average weekly training volume (kg) for this muscle over the last 4 weeks. */
  weeklyVolumeAvg: number;
  /** Rough per-muscle weekly volume target (kg) — see muscle-volume-targets.ts. */
  muscleVolumeTarget: number;
  thisWeekVolume: number;
  /** 0 when there's no prior week to compare against (trendScore defaults to neutral 50). */
  lastWeekVolume: number;
  /** Estimated 1RM (kg) from the most recent training, null if never trained. */
  currentEst1RM: number | null;
  /** Estimated 1RM (kg) from ~4 weeks ago, null if no baseline to compare against. */
  est1RMFourWeeksAgo: number | null;
  /** Large sentinel (e.g. 999) when the muscle has never been trained. */
  daysSinceLastTrained: number;
  /** Distinct weeks with any training volume for this muscle, over the last 8 weeks. */
  distinctTrainingWeeksLast8: number;
}

/**
 * A 0-100 product visualization score for how "on track" a muscle group's
 * training is — NOT a medical or scientific fitness measurement. Weighted
 * blend of training frequency, volume vs. a rough target, week-over-week
 * volume trend, strength progression, and consistency, penalized for days
 * since last trained. See docs referenced from progress.service.ts for the
 * caching strategy around this pure function.
 */
export function calculateMuscleProgressScore(input: MuscleScoreInput): number {
  const freqScore = Math.min(100, (input.sessionsLast4Weeks / 8) * 100);

  const volumeScore =
    input.muscleVolumeTarget > 0 ? Math.min(100, (input.weeklyVolumeAvg / input.muscleVolumeTarget) * 100) : 0;

  const trendScore =
    input.lastWeekVolume > 0
      ? clamp(50 + ((input.thisWeekVolume - input.lastWeekVolume) / input.lastWeekVolume) * 100, 0, 100)
      : 50;

  const strengthScore =
    input.currentEst1RM !== null && input.est1RMFourWeeksAgo
      ? Math.min(100, (input.currentEst1RM / input.est1RMFourWeeksAgo) * 100)
      : 50;

  const recencyPenalty = input.daysSinceLastTrained <= 3 ? 0 : Math.min(40, (input.daysSinceLastTrained - 3) * 4);

  const consistencyScore = Math.min(100, (input.distinctTrainingWeeksLast8 / 8) * 100);

  const raw =
    0.25 * freqScore +
    0.25 * volumeScore +
    0.15 * trendScore +
    0.15 * strengthScore +
    0.1 * consistencyScore +
    0.1 * 100;

  return Math.round(clamp(raw - recencyPenalty, 0, 100));
}
