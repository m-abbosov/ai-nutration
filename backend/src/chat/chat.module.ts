import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { NutritionModule } from '../nutrition/nutrition.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [AiModule, NutritionModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
