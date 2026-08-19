import { Language } from '@prisma/client';
import { normalizeExerciseText } from './normalize-text.util';

export interface MatchableAlias {
  language: Language;
  normalized: string;
}

export interface MatchableExercise {
  exerciseId: string;
  slug: string;
  aliases: MatchableAlias[];
}

export interface ExerciseCandidate {
  exerciseId: string;
  slug: string;
}

export type ExerciseMatchResult =
  | { status: 'matched'; exerciseId: string; slug: string }
  | { status: 'ambiguous'; candidates: ExerciseCandidate[] }
  | { status: 'unmatched' };

const MIN_FUZZY_TOKEN_LEN = 4;
const MIN_SUBSTRING_LEN = 4;
const FUZZY_SCORE_THRESHOLD = 0.5;
const MAX_CANDIDATES = 5;

function tokenize(normalized: string): string[] {
  return normalized.split(' ').filter(Boolean);
}

// Treats two tokens as matching if they're equal, or one is a prefix of the
// other with enough shared length. Handles agglutinative case suffixes (e.g.
// Uzbek "yelkaga" = "yelka" + dative "-ga") without full morphological
// analysis — good enough for gym-vocabulary-sized tokens.
function tokensFuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return shorter.length >= MIN_FUZZY_TOKEN_LEN && longer.startsWith(shorter);
}

function aliasFuzzyScore(rawTokens: string[], aliasTokens: string[]): number {
  if (aliasTokens.length === 0) return 0;
  const matched = aliasTokens.filter((at) => rawTokens.some((rt) => tokensFuzzyMatch(at, rt))).length;
  return matched / aliasTokens.length;
}

/**
 * Resolves free-text extracted by the AI workout parser (e.g. "Triceps
 * pushdown", "shoulder press", "Yelkaga max") against the seeded exercise
 * catalog. Three passes, cheapest/most-confident first:
 *
 *  1. Exact alias match (preferred language, then any language — a user's
 *     profile language may differ from the language they happen to type an
 *     exercise name in).
 *  2. Substring containment either direction.
 *  3. Fuzzy token overlap (>= 50% of an alias's tokens fuzzy-match a raw
 *     token) — this is what catches vague phrases like "Yelkaga max" against
 *     multiple shoulder-area exercise aliases, correctly surfacing them as
 *     ambiguous rather than guessing one.
 *
 * A single hit at any pass is a confident match; multiple hits are
 * "ambiguous" (caller renders a "Did you mean X? [X] [Choose another]"
 * picker); zero hits is "unmatched" (caller renders a free-text row with a
 * manual exercise picker). Never invents a match it isn't reasonably sure of.
 */
export function matchExercise(
  rawText: string,
  language: Language,
  catalog: MatchableExercise[],
): ExerciseMatchResult {
  const normalizedRaw = normalizeExerciseText(rawText);
  if (!normalizedRaw) return { status: 'unmatched' };

  const exactSameLanguage = catalog.find((ex) =>
    ex.aliases.some((a) => a.language === language && a.normalized === normalizedRaw),
  );
  if (exactSameLanguage) return { status: 'matched', exerciseId: exactSameLanguage.exerciseId, slug: exactSameLanguage.slug };

  const exactAnyLanguage = catalog.find((ex) => ex.aliases.some((a) => a.normalized === normalizedRaw));
  if (exactAnyLanguage) return { status: 'matched', exerciseId: exactAnyLanguage.exerciseId, slug: exactAnyLanguage.slug };

  const substringHits = new Map<string, MatchableExercise>();
  for (const ex of catalog) {
    for (const alias of ex.aliases) {
      if (alias.normalized.length < MIN_SUBSTRING_LEN) continue;
      if (normalizedRaw.includes(alias.normalized) || alias.normalized.includes(normalizedRaw)) {
        substringHits.set(ex.exerciseId, ex);
        break;
      }
    }
  }
  if (substringHits.size === 1) {
    const ex = [...substringHits.values()][0];
    return { status: 'matched', exerciseId: ex.exerciseId, slug: ex.slug };
  }
  if (substringHits.size > 1) {
    return {
      status: 'ambiguous',
      candidates: [...substringHits.values()].slice(0, MAX_CANDIDATES).map((e) => ({ exerciseId: e.exerciseId, slug: e.slug })),
    };
  }

  const rawTokens = tokenize(normalizedRaw);
  const scored = catalog
    .map((ex) => ({
      ex,
      score: Math.max(0, ...ex.aliases.map((a) => aliasFuzzyScore(rawTokens, tokenize(a.normalized)))),
    }))
    .filter((s) => s.score >= FUZZY_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 1) {
    return { status: 'matched', exerciseId: scored[0].ex.exerciseId, slug: scored[0].ex.slug };
  }
  if (scored.length > 1) {
    return {
      status: 'ambiguous',
      candidates: scored.slice(0, MAX_CANDIDATES).map((s) => ({ exerciseId: s.ex.exerciseId, slug: s.ex.slug })),
    };
  }

  return { status: 'unmatched' };
}
