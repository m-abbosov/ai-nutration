import { Module } from '@nestjs/common';
import { NutritionModule } from '../nutrition/nutrition.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [NutritionModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
