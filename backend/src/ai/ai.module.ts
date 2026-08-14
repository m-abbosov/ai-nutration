import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';

@Module({
  providers: [GeminiService, AiService],
  exports: [AiService, GeminiService],
})
export class AiModule {}
