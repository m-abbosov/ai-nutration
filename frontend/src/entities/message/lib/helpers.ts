import type { NutritionAnalysisDto } from '@nutriai/shared/api/types'

/** Relative bar widths for the protein/carb/fat rows on a nutrition card, matching
 * the design's `mx = Math.max(p, c, f)` normalization. */
export function macroBarWidths(total: NutritionAnalysisDto['total']) {
  const max = Math.max(total.protein, total.carbs, total.fat, 1)
  return {
    protein: Math.round((total.protein / max) * 100),
    carbs: Math.round((total.carbs / max) * 100),
    fat: Math.round((total.fat / max) * 100),
  }
}
