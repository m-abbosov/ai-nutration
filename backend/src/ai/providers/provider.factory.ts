import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProvider } from '@prisma/client';
import { EnvConfig } from '../../config/env.validation';
import { AiProviderClient } from './provider.types';
import { GeminiProvider } from './gemini-provider';
import { OpenAiProvider } from './openai-provider';
import { ClaudeProvider } from './claude-provider';

@Injectable()
export class ProviderFactory {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  create(provider: AiProvider, apiKey: string): AiProviderClient {
    switch (provider) {
      case 'GEMINI':
        return new GeminiProvider(
          apiKey,
          this.configService.get('GEMINI_MODEL', { infer: true }),
        );
      case 'OPENAI':
        return new OpenAiProvider(
          apiKey,
          this.configService.get('OPENAI_MODEL', { infer: true }),
        );
      case 'CLAUDE':
        return new ClaudeProvider(
          apiKey,
          this.configService.get('CLAUDE_MODEL', { infer: true }),
        );
    }
  }
}
