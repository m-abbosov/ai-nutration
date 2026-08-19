import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ExerciseModule } from '../fitness/exercise/exercise.module';
import { MealsModule } from '../meals/meals.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AiModule, NutritionModule, MealsModule, ExerciseModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
