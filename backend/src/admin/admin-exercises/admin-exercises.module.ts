import { Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { AdminExercisesController } from './admin-exercises.controller';
import { AdminExercisesService } from './admin-exercises.service';

@Module({
  imports: [AuditModule],
  controllers: [AdminExercisesController],
  providers: [AdminExercisesService],
})
export class AdminExercisesModule {}
