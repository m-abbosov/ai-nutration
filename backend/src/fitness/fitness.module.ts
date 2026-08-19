import { Module } from '@nestjs/common';
import { FitnessAnalyticsModule } from './analytics/fitness-analytics.module';
import { ExerciseModule } from './exercise/exercise.module';
import { MuscleModule } from './muscle/muscle.module';
import { ProgressModule } from './progress/progress.module';
import { WorkoutModule } from './workout/workout.module';

// Aggregate module for the Fitness Tracker feature.
@Module({
  imports: [ExerciseModule, WorkoutModule, MuscleModule, ProgressModule, FitnessAnalyticsModule],
})
export class FitnessModule {}
