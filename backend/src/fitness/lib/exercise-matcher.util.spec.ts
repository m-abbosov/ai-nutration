import { normalizeExerciseText } from './normalize-text.util';
import { MatchableExercise, matchExercise } from './exercise-matcher.util';

function alias(language: 'EN' | 'RU' | 'UZ', text: string) {
  return { language, normalized: normalizeExerciseText(text) };
}

// A small hand-built catalog mirroring real seed-exercises.ts rows, so these
// tests don't depend on the database.
const CATALOG: MatchableExercise[] = [
  {
    exerciseId: 'ex-bench-press',
    slug: 'bench-press',
    aliases: [alias('EN', 'Bench Press'), alias('EN', 'Bench'), alias('RU', 'Жим лёжа'), alias('UZ', 'Bench press')],
  },
  {
    exerciseId: 'ex-shoulder-press',
    slug: 'shoulder-press',
    aliases: [
      alias('EN', 'Shoulder Press'),
      alias('EN', 'Overhead Press'),
      alias('EN', 'OHP'),
      alias('RU', 'Жим гантелей сидя'),
      alias('UZ', 'Yelka pressi'),
      alias('UZ', 'Shoulder press'),
    ],
  },
  {
    exerciseId: 'ex-shrug',
    slug: 'shrug',
    aliases: [alias('EN', 'Shrug'), alias('EN', 'Shoulder Shrug'), alias('RU', 'Шраги'), alias('UZ', 'Shrug'), alias('UZ', "Yelka ko'tarish")],
  },
  {
    exerciseId: 'ex-triceps-pushdown',
    slug: 'triceps-pushdown',
    aliases: [
      alias('EN', 'Triceps Pushdown'),
      alias('EN', 'Tricep Pushdown'),
      alias('EN', 'Cable Pushdown'),
      alias('RU', 'Разгибание рук на блоке'),
      alias('UZ', 'Triceps pushdown'),
    ],
  },
  {
    exerciseId: 'ex-squat',
    slug: 'squat',
    aliases: [alias('EN', 'Squat'), alias('EN', 'Back Squat'), alias('RU', 'Приседания'), alias('UZ', 'Squat')],
  },
];

describe('exercise-matcher.util', () => {
  it('matches an exact EN alias verbatim from the original brief', () => {
    expect(matchExercise('Triceps pushdown', 'EN', CATALOG)).toEqual({
      status: 'matched',
      exerciseId: 'ex-triceps-pushdown',
      slug: 'triceps-pushdown',
    });
  });

  it('matches case-insensitively and ignores surrounding whitespace', () => {
    expect(matchExercise('  BENCH PRESS  ', 'EN', CATALOG)).toEqual({
      status: 'matched',
      exerciseId: 'ex-bench-press',
      slug: 'bench-press',
    });
  });

  it('matches "shoulder press" extracted from the Uzbek phrase "3 set shoulder press qildim"', () => {
    expect(matchExercise('shoulder press', 'UZ', CATALOG)).toEqual({
      status: 'matched',
      exerciseId: 'ex-shoulder-press',
      slug: 'shoulder-press',
    });
  });

  it('matches an EN alias even when the request language is RU (any-language exact fallback)', () => {
    expect(matchExercise('OHP', 'RU', CATALOG)).toEqual({
      status: 'matched',
      exerciseId: 'ex-shoulder-press',
      slug: 'shoulder-press',
    });
  });

  it('matches a Russian phrase for bench press', () => {
    expect(matchExercise('Жим лёжа', 'RU', CATALOG)).toEqual({
      status: 'matched',
      exerciseId: 'ex-bench-press',
      slug: 'bench-press',
    });
  });

  it('treats the vague Uzbek phrase "Yelkaga max" as ambiguous, not a guess', () => {
    const result = matchExercise('Yelkaga max', 'UZ', CATALOG);
    expect(result.status).toBe('ambiguous');
    if (result.status === 'ambiguous') {
      const slugs = result.candidates.map((c) => c.slug);
      expect(slugs).toContain('shoulder-press');
      expect(slugs.length).toBeGreaterThan(1);
    }
  });

  it('returns unmatched for text with no relation to the catalog', () => {
    expect(matchExercise('qandaydir notanish mashq', 'UZ', CATALOG)).toEqual({ status: 'unmatched' });
  });

  it('returns unmatched for empty/whitespace-only text', () => {
    expect(matchExercise('   ', 'EN', CATALOG)).toEqual({ status: 'unmatched' });
  });

  it('matches a partial substring like "bench" alone', () => {
    expect(matchExercise('bench', 'EN', CATALOG)).toEqual({
      status: 'matched',
      exerciseId: 'ex-bench-press',
      slug: 'bench-press',
    });
  });

  it('is robust to Uzbek apostrophe glyph variants in stored aliases', () => {
    // "Yelka ko'tarish" (shrug) was seeded with a typographic apostrophe;
    // a user typing a straight quote should still resolve to it.
    expect(matchExercise("yelka ko'tarish", 'UZ', CATALOG)).toEqual({
      status: 'matched',
      exerciseId: 'ex-shrug',
      slug: 'shrug',
    });
  });
});
