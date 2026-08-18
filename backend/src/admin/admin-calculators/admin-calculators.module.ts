import { Module } from '@nestjs/common';
import { AdminCalculatorsController } from './admin-calculators.controller';
import { AdminCalculatorsService } from './admin-calculators.service';

@Module({
  controllers: [AdminCalculatorsController],
  providers: [AdminCalculatorsService],
})
export class AdminCalculatorsModule {}
