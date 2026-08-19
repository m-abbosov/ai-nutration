import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  imports: [AiModule, NutritionModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
