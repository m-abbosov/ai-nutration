import type { NutritionWeeklyPointDto } from '@nutriai/shared/api/types'

/**
 * Derived progress stats computed client-side from `NutritionWeeklyPointDto[]`
 * (the only per-day series the Phase 1 contract exposes — no per-day macro
 * breakdown, so this deliberately does not fabricate an "avg protein" figure;
 * see DESIGN_MAPPING.md / the frontend agent's final report for the note on
 * this contract limitation).
 */
export function computeWeeklyStats(points: NutritionWeeklyPointDto[]) {
  if (points.length === 0) {
    return { avgConsumed: 0, adherencePct: 0, successfulDays: 0, totalDays: 0, dayDots: [] as boolean[] }
  }
  const avgConsumed = Math.round(points.reduce((sum, p) => sum + p.consumed, 0) / points.length)
  const dayDots = points.map((p) => Math.abs(p.consumed - p.target) <= p.target * 0.1)
  const successfulDays = dayDots.filter(Boolean).length
  const adherencePct = Math.round((successfulDays / points.length) * 100)
  return { avgConsumed, adherencePct, successfulDays, totalDays: points.length, dayDots }
}
