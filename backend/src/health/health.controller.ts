import { Controller, Get } from '@nestjs/common';
import { GeminiService } from '../ai/gemini.service';

@Controller('health')
export class HealthController {
  constructor(private readonly gemini: GeminiService) {}

  @Get()
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }

  // Never returns the key itself — only whether one is configured.
  @Get('gemini')
  getGeminiHealth(): { connected: boolean } {
    return { connected: this.gemini.isConfigured() };
  }
}
