import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ProviderFactory } from './providers/provider.factory';
import { UserAiCredentialsService } from './user-ai-credentials.service';

@Module({
  providers: [ProviderFactory, AiService, UserAiCredentialsService],
  exports: [AiService, ProviderFactory, UserAiCredentialsService],
})
export class AiModule {}
