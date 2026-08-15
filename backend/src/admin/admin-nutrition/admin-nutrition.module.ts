import { Module } from '@nestjs/common';
import { AdminNutritionController } from './admin-nutrition.controller';
import { AdminNutritionService } from './admin-nutrition.service';

@Module({
  controllers: [AdminNutritionController],
  providers: [AdminNutritionService],
})
export class AdminNutritionModule {}
