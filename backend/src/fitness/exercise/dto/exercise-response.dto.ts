import { ExerciseCategory, MuscleCode, MuscleRole } from '@prisma/client';

export interface ExerciseMuscleDto {
  muscle: MuscleCode;
  role: MuscleRole;
  weight: number;
}

export interface ExerciseResponseDto {
  id: string;
  slug: string;
  // Resolved for the requested language (falls back to English, then the
  // slug itself, if no alias is seeded for that language — see
  // exercise.service.ts resolveName).
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleCode;
  equipment: string | null;
  muscles: ExerciseMuscleDto[];
}
