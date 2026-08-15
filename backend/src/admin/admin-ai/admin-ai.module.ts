import { Module } from '@nestjs/common';
import { AdminAiController } from './admin-ai.controller';
import { AdminAiService } from './admin-ai.service';

@Module({
  controllers: [AdminAiController],
  providers: [AdminAiService],
})
export class AdminAiModule {}
