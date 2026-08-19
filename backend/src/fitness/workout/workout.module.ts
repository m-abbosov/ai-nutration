import { Module } from '@nestjs/common';
import { FitnessAnalyticsModule } from '../analytics/fitness-analytics.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { ProgressModule } from '../progress/progress.module';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';

@Module({
  imports: [ExerciseModule, ProgressModule, FitnessAnalyticsModule],
  controllers: [WorkoutController],
  providers: [WorkoutService],
  exports: [WorkoutService],
})
export class WorkoutModule {}
