import { Module } from '@nestjs/common';
import { AiRequestLogService } from './ai-request-log.service';
import { AiService } from './ai.service';
import { ProviderFactory } from './providers/provider.factory';
import { UserAiCredentialsService } from './user-ai-credentials.service';

@Module({
  providers: [
    ProviderFactory,
    AiService,
    UserAiCredentialsService,
    AiRequestLogService,
  ],
  exports: [AiService, ProviderFactory, UserAiCredentialsService],
})
export class AiModule {}
