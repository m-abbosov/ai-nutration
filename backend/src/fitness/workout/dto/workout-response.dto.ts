import { WeightUnit, WorkoutSource } from '@prisma/client';
import { DetectedPrDto } from '../../analytics/dto/detected-pr.dto';

export interface ExerciseSetResponseDto {
  id: string;
  setNumber: number;
  weight: number | null;
  weightUnit: WeightUnit;
  reps: number | null;
  durationSec: number | null;
  completed: boolean;
}

export interface WorkoutExerciseResponseDto {
  id: string;
  exerciseId: string;
  // Slug only — the frontend resolves the display name from the already-cached
  // GET /fitness/exercises catalog (useExercises), which is language-aware.
  // Keeps this endpoint decoupled from i18n/alias resolution entirely.
  exerciseSlug: string;
  order: number;
  sets: ExerciseSetResponseDto[];
}

export interface WorkoutResponseDto {
  id: string;
  date: string;
  startedAt: string | null;
  endedAt: string | null;
  durationSec: number | null;
  notes: string | null;
  totalVolume: number;
  estimatedCalories: number | null;
  source: WorkoutSource;
  exercises: WorkoutExerciseResponseDto[];
  createdAt: string;
  // Populated only on the create response — empty on list/get. Lets the
  // Phase D "New PR!" celebration render straight off the save response
  // without a second round trip.
  newPersonalRecords: DetectedPrDto[];
}
