import { Module } from '@nestjs/common';
import { ProgressModule } from '../progress/progress.module';
import { MuscleController } from './muscle.controller';
import { MuscleService } from './muscle.service';

@Module({
  imports: [ProgressModule],
  controllers: [MuscleController],
  providers: [MuscleService],
})
export class MuscleModule {}
