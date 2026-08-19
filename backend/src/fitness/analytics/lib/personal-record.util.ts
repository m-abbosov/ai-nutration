import { PRType, WeightUnit } from '@prisma/client';
import { estimateOneRepMax } from '../../lib/estimate-1rm.util';
import { toKg } from '../../workout/lib/volume.util';

export interface PRSetInput {
  weight: number | null;
  weightUnit: WeightUnit;
  reps: number | null;
  completed: boolean;
}

export interface ExistingPR {
  recordType: PRType;
  value: number;
}

export interface DetectedPR {
  recordType: PRType;
  value: number;
  weight: number | null;
  reps: number | null;
}

/**
 * Compares one exercise's sets from a just-saved workout against that
 * exercise's current best per PRType (MAX_WEIGHT/MAX_REPS/MAX_VOLUME/EST_1RM)
 * and returns only the ones that were actually beaten — an empty array means
 * no PR this time, which is the common case. Values are always in kg
 * (weight-bearing PTypes), independent of which unit the set was logged in.
 */
export function detectPersonalRecords(sets: PRSetInput[], existing: ExistingPR[]): DetectedPR[] {
  const existingMap = new Map(existing.map((e) => [e.recordType, e.value]));
  const completed = sets.filter((s) => s.completed);
  const results: DetectedPR[] = [];

  const weighted = completed.filter((s): s is PRSetInput & { weight: number } => s.weight !== null);
  if (weighted.length > 0) {
    const best = weighted.reduce((a, b) => (toKg(b.weight, b.weightUnit) > toKg(a.weight, a.weightUnit) ? b : a));
    const value = toKg(best.weight, best.weightUnit);
    if (value > (existingMap.get('MAX_WEIGHT') ?? 0)) {
      results.push({ recordType: 'MAX_WEIGHT', value, weight: value, reps: best.reps });
    }
  }

  const repped = completed.filter((s): s is PRSetInput & { reps: number } => s.reps !== null);
  if (repped.length > 0) {
    const best = repped.reduce((a, b) => (b.reps > a.reps ? b : a));
    if (best.reps > (existingMap.get('MAX_REPS') ?? 0)) {
      results.push({
        recordType: 'MAX_REPS',
        value: best.reps,
        weight: best.weight !== null ? toKg(best.weight, best.weightUnit) : null,
        reps: best.reps,
      });
    }
  }

  const weightedAndRepped = completed.filter(
    (s): s is PRSetInput & { weight: number; reps: number } => s.weight !== null && s.reps !== null,
  );

  if (weightedAndRepped.length > 0) {
    const bestVolume = weightedAndRepped.reduce((a, b) =>
      toKg(b.weight, b.weightUnit) * b.reps > toKg(a.weight, a.weightUnit) * a.reps ? b : a,
    );
    const volumeValue = toKg(bestVolume.weight, bestVolume.weightUnit) * bestVolume.reps;
    if (volumeValue > (existingMap.get('MAX_VOLUME') ?? 0)) {
      results.push({
        recordType: 'MAX_VOLUME',
        value: volumeValue,
        weight: toKg(bestVolume.weight, bestVolume.weightUnit),
        reps: bestVolume.reps,
      });
    }

    const best1rm = weightedAndRepped.reduce((a, b) =>
      estimateOneRepMax(toKg(b.weight, b.weightUnit), b.reps) > estimateOneRepMax(toKg(a.weight, a.weightUnit), a.reps) ? b : a,
    );
    const est1rmValue = estimateOneRepMax(toKg(best1rm.weight, best1rm.weightUnit), best1rm.reps);
    if (est1rmValue > (existingMap.get('EST_1RM') ?? 0)) {
      results.push({
        recordType: 'EST_1RM',
        value: est1rmValue,
        weight: toKg(best1rm.weight, best1rm.weightUnit),
        reps: best1rm.reps,
      });
    }
  }

  return results;
}
