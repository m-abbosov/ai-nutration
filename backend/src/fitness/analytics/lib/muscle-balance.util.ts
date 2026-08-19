import { MuscleCode } from '@prisma/client';

// Every one of the 18 muscles falls into exactly one push/pull/legs/core
// bucket for this breakdown.
export const PUSH_MUSCLES: MuscleCode[] = ['CHEST', 'UPPER_CHEST', 'SHOULDERS', 'FRONT_DELTS', 'SIDE_DELTS', 'TRICEPS'];
export const PULL_MUSCLES: MuscleCode[] = ['BACK', 'LATS', 'TRAPS', 'REAR_DELTS', 'BICEPS', 'FOREARMS'];
export const LEGS_MUSCLES: MuscleCode[] = ['GLUTES', 'QUADS', 'HAMSTRINGS', 'CALVES'];
export const CORE_MUSCLES: MuscleCode[] = ['ABS', 'OBLIQUES'];

export interface MuscleBalanceGroup {
  volume: number;
  percentage: number;
}

export interface MuscleBalanceResult {
  push: MuscleBalanceGroup;
  pull: MuscleBalanceGroup;
  legs: MuscleBalanceGroup;
  core: MuscleBalanceGroup;
}

/** Groups per-muscle training volume into push/pull/legs/core, purely from
 * real recorded volume — never an invented split. All-zero input yields
 * all-zero percentages rather than NaN/division-by-zero. */
export function calculateMuscleBalance(volumeByMuscle: Partial<Record<MuscleCode, number>>): MuscleBalanceResult {
  const sum = (codes: MuscleCode[]) => codes.reduce((total, code) => total + (volumeByMuscle[code] ?? 0), 0);

  const pushVolume = sum(PUSH_MUSCLES);
  const pullVolume = sum(PULL_MUSCLES);
  const legsVolume = sum(LEGS_MUSCLES);
  const coreVolume = sum(CORE_MUSCLES);
  const total = pushVolume + pullVolume + legsVolume + coreVolume;

  const percentage = (volume: number) => (total > 0 ? Math.round((volume / total) * 1000) / 10 : 0);

  return {
    push: { volume: pushVolume, percentage: percentage(pushVolume) },
    pull: { volume: pullVolume, percentage: percentage(pullVolume) },
    legs: { volume: legsVolume, percentage: percentage(legsVolume) },
    core: { volume: coreVolume, percentage: percentage(coreVolume) },
  };
}
