const DEFAULT_BODY_WEIGHT_KG = 70;
// MET (metabolic equivalent) for moderate-to-vigorous resistance training.
const RESISTANCE_TRAINING_MET = 5;
// Rough fallback when no duration was logged (e.g. a quick chat-logged
// workout with no start/end time): kcal burned per kg of total volume moved.
const KCAL_PER_KG_VOLUME_FALLBACK = 0.05;

export interface EstimateCaloriesInput {
  durationSec: number | null;
  totalVolumeKg: number;
  bodyWeightKg?: number | null;
}

/** A rough session-calorie estimate — a product-facing number, not a medical
 * or scientific measurement. Prefers the MET × bodyweight × time formula when
 * a duration was logged; falls back to a volume-based heuristic otherwise. */
export function estimateWorkoutCalories(input: EstimateCaloriesInput): number {
  const bodyWeightKg = input.bodyWeightKg ?? DEFAULT_BODY_WEIGHT_KG;
  if (input.durationSec && input.durationSec > 0) {
    const hours = input.durationSec / 3600;
    return Math.round(RESISTANCE_TRAINING_MET * bodyWeightKg * hours);
  }
  return Math.round(input.totalVolumeKg * KCAL_PER_KG_VOLUME_FALLBACK);
}
