import { Injectable } from '@nestjs/common';
import { Exercise, ExerciseAlias, ExerciseMuscle, Language, MuscleCode } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ExerciseMatchResult, MatchableExercise, matchExercise } from '../lib/exercise-matcher.util';
import { ExerciseResponseDto } from './dto/exercise-response.dto';

type ExerciseWithRelations = Exercise & {
  aliases: ExerciseAlias[];
  muscles: ExerciseMuscle[];
};

/** Picks the display name for the requested language: primary alias in that
 * language, else primary alias in English, else the raw slug. Every seeded
 * exercise has an EN primary alias (see seed-exercises.ts), so the slug
 * fallback only fires for future manually-inserted rows missing one. */
function resolveName(exercise: ExerciseWithRelations, language: Language): string {
  const primaries = exercise.aliases.filter((a) => a.isPrimary);
  return (
    primaries.find((a) => a.language === language)?.alias ??
    primaries.find((a) => a.language === 'EN')?.alias ??
    exercise.slug
  );
}

function toResponseDto(exercise: ExerciseWithRelations, language: Language): ExerciseResponseDto {
  return {
    id: exercise.id,
    slug: exercise.slug,
    name: resolveName(exercise, language),
    category: exercise.category,
    primaryMuscle: exercise.primaryMuscle,
    equipment: exercise.equipment,
    muscles: exercise.muscles.map((m) => ({ muscle: m.muscle, role: m.role, weight: m.weight })),
  };
}

@Injectable()
export class ExerciseService {
  constructor(private readonly prisma: PrismaService) {}

  async list(language: Language = 'EN', muscle?: MuscleCode): Promise<ExerciseResponseDto[]> {
    const exercises = await this.prisma.exercise.findMany({
      where: muscle ? { muscles: { some: { muscle } } } : undefined,
      include: { aliases: true, muscles: true },
      orderBy: { slug: 'asc' },
    });
    return exercises.map((e) => toResponseDto(e, language));
  }

  /** Used by workout.service.ts to verify every exerciseId in a create-workout
   * payload actually exists before persisting, without a round trip per id. */
  async findManyByIds(ids: string[]): Promise<Exercise[]> {
    if (ids.length === 0) return [];
    return this.prisma.exercise.findMany({ where: { id: { in: ids } } });
  }

  /** Full catalog reduced to just what exercise-matcher.util.ts needs. The
   * catalog is small (tens of rows) so no caching layer — a fresh query per
   * chat message is cheap and always reflects the latest seeded aliases. */
  private async getMatchableCatalog(): Promise<MatchableExercise[]> {
    const exercises = await this.prisma.exercise.findMany({
      select: { id: true, slug: true, aliases: { select: { language: true, normalized: true } } },
    });
    return exercises.map((e) => ({ exerciseId: e.id, slug: e.slug, aliases: e.aliases }));
  }

  /** Resolves one AI-extracted exercise phrase against the catalog — see
   * exercise-matcher.util.ts for the matched/ambiguous/unmatched contract. */
  async matchExerciseText(rawText: string, language: Language): Promise<ExerciseMatchResult> {
    const catalog = await this.getMatchableCatalog();
    return matchExercise(rawText, language, catalog);
  }
}
