import { Exercise, ExerciseSet, Workout, WorkoutExercise } from '@prisma/client';
import { formatDateOnly } from '../../common/date.util';
import { DetectedPrDto } from '../analytics/dto/detected-pr.dto';
import { WorkoutResponseDto } from './dto/workout-response.dto';

type WorkoutWithRelations = Workout & {
  exercises: (WorkoutExercise & { exercise: Exercise; sets: ExerciseSet[] })[];
};

export function toWorkoutResponseDto(workout: WorkoutWithRelations, newPersonalRecords: DetectedPrDto[] = []): WorkoutResponseDto {
  return {
    id: workout.id,
    date: formatDateOnly(workout.date),
    startedAt: workout.startedAt?.toISOString() ?? null,
    endedAt: workout.endedAt?.toISOString() ?? null,
    durationSec: workout.durationSec,
    notes: workout.notes,
    totalVolume: workout.totalVolume,
    estimatedCalories: workout.estimatedCalories,
    source: workout.source,
    exercises: workout.exercises
      .sort((a, b) => a.order - b.order)
      .map((we) => ({
        id: we.id,
        exerciseId: we.exerciseId,
        exerciseSlug: we.exercise.slug,
        order: we.order,
        sets: we.sets
          .sort((a, b) => a.setNumber - b.setNumber)
          .map((s) => ({
            id: s.id,
            setNumber: s.setNumber,
            weight: s.weight,
            weightUnit: s.weightUnit,
            reps: s.reps,
            durationSec: s.durationSec,
            completed: s.completed,
          })),
      })),
    createdAt: workout.createdAt.toISOString(),
    newPersonalRecords,
  };
}
