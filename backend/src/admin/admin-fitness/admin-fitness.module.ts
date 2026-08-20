import { Module } from '@nestjs/common';
import { AdminFitnessController } from './admin-fitness.controller';
import { AdminFitnessService } from './admin-fitness.service';

@Module({
  controllers: [AdminFitnessController],
  providers: [AdminFitnessService],
})
export class AdminFitnessModule {}
