/**
 * Shared normalization used both when seeding ExerciseAlias.normalized rows
 * (seed-exercises.ts) and when matching free-text workout input against the
 * catalog (exercise-matcher.util.ts). Keeping one function guarantees a seeded
 * alias and a runtime lookup key are always computed the same way.
 *
 * Unifies Uzbek Latin apostrophe variants (o'/g' are written with several
 * different unicode apostrophe glyphs depending on keyboard/input method),
 * strips diacritics, and collapses whitespace/punctuation.
 */
export function normalizeExerciseText(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ʻʼ‘’`]/g, "'")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
