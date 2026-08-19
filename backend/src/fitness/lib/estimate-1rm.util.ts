/** Epley formula — a standard, widely-used estimate, not a lab measurement.
 * Returns the raw weight unchanged for a 1-rep set (no extrapolation needed). */
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}
