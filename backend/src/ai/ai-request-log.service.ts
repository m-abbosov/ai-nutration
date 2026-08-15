import { Injectable, Logger } from '@nestjs/common';
import { AiEndpoint, AiProvider, AiRequestStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ProviderUsage } from './providers/provider.types';

export interface RecordAiRequestParams {
  userId: string | null;
  endpoint: AiEndpoint;
  provider: AiProvider;
  model: string;
  status: AiRequestStatus;
  errorReason: string | null;
  responseTimeMs: number;
  usage: ProviderUsage | null;
}

/**
 * Writes one `AiRequestLog` row per provider call attempt. Never stores a
 * prompt or response body — metadata only (see docs/ADMIN_PANEL.md, "AI
 * request logging & privacy"). Logging failures are swallowed (logged
 * server-side) so a DB hiccup here never breaks the user-facing chat/
 * recommendations flow that's already succeeded or failed on its own terms.
 */
@Injectable()
export class AiRequestLogService {
  private readonly logger = new Logger(AiRequestLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(params: RecordAiRequestParams): Promise<void> {
    try {
      await this.prisma.aiRequestLog.create({
        data: {
          userId: params.userId,
          endpoint: params.endpoint,
          provider: params.provider,
          model: params.model,
          status: params.status,
          errorReason: params.errorReason,
          responseTimeMs: params.responseTimeMs,
          promptTokens: params.usage?.promptTokens ?? null,
          completionTokens: params.usage?.completionTokens ?? null,
          totalTokens: params.usage?.totalTokens ?? null,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to write AiRequestLog: ${(err as Error).message}`,
      );
    }
  }
}
