/**
 * Maps a 0-100 muscle progressScore to a CSS color-token band. This is a
 * product visualization score, not a medical measurement — see
 * backend/src/fitness/progress/lib/muscle-score.util.ts for how it's computed.
 * Bands: 0-20 inactive, 21-40 low, 41-60 moderate, 61-80 good, 81-100 strong.
 * Tokens are defined in app/styles/theme.css and already adapt to light/dark
 * via the existing data-theme mechanism — this file never hardcodes a color.
 */
export function muscleScoreColorVar(score: number): string {
  if (score <= 20) return "var(--m1)";
  if (score <= 40) return "var(--m2)";
  if (score <= 60) return "var(--m3)";
  if (score <= 80) return "var(--m4)";
  return "var(--m5)";
}

export function muscleScoreTintVar(score: number): string {
  if (score <= 20) return "var(--m1T)";
  if (score <= 40) return "var(--m2T)";
  if (score <= 60) return "var(--m3T)";
  if (score <= 80) return "var(--m4T)";
  return "var(--m5T)";
}
