/** Epley formula — a standard, widely-used estimate, not a lab measurement.
 * Mirrors backend/src/fitness/lib/estimate-1rm.util.ts exactly, duplicated
 * here since it's a single-line formula the strength-progress chart needs
 * client-side (no per-exercise 1RM time series endpoint exists — the chart
 * derives it from the same raw workout history the workouts list already
 * fetches). */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}
