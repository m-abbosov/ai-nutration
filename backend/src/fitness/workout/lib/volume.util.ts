import { WeightUnit } from '@prisma/client';

const LB_TO_KG = 0.453592;

export interface VolumeSetInput {
  weight: number | null;
  weightUnit: WeightUnit;
  reps: number | null;
  completed: boolean;
}

/** Standardizes a set's weight to kg regardless of the unit it was logged in. */
export function toKg(weight: number, unit: WeightUnit): number {
  return unit === 'LB' ? weight * LB_TO_KG : weight;
}

/** Total training volume in kg: sum(weight_kg * reps) across completed sets
 * with both a weight and reps recorded. Bodyweight/duration-only sets (no
 * weight, e.g. a plank) contribute 0 to volume — they're still valid sets,
 * just not load-bearing for this metric. */
export function calculateSetVolume(set: VolumeSetInput): number {
  if (!set.completed || set.weight === null || set.reps === null) return 0;
  return toKg(set.weight, set.weightUnit) * set.reps;
}

export function calculateTotalVolume(exercises: { sets: VolumeSetInput[] }[]): number {
  const total = exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((exSum, set) => exSum + calculateSetVolume(set), 0),
    0,
  );
  return Math.round(total * 10) / 10;
}
