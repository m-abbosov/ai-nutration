import { Module } from '@nestjs/common';
import { ProgressModule } from '../progress/progress.module';
import { FitnessAnalyticsController } from './fitness-analytics.controller';
import { MuscleBalanceService } from './muscle-balance.service';
import { PersonalRecordService } from './personal-record.service';

@Module({
  imports: [ProgressModule],
  controllers: [FitnessAnalyticsController],
  providers: [PersonalRecordService, MuscleBalanceService],
  exports: [PersonalRecordService],
})
export class FitnessAnalyticsModule {}
