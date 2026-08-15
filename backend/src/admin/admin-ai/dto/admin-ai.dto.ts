import { AiEndpoint, AiProvider, AiRequestStatus } from '@prisma/client';
import { SeriesPointDto } from '../../common/dto-types';

export interface AdminAiOverviewDto {
  requests: number;
  successCount: number;
  failureCount: number;
  errorRatePct: number;
  avgResponseTimeMs: number;
  requestsPerDay: SeriesPointDto[];
  requestsPerEndpoint: { endpoint: AiEndpoint; count: number }[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  } | null;
}

export interface AdminAiRequestListItemDto {
  id: string;
  createdAt: string;
  userName: string | null;
  endpoint: AiEndpoint;
  provider: AiProvider;
  model: string;
  status: AiRequestStatus;
  responseTimeMs: number;
  errorReason: string | null;
}

export interface AdminAiRequestDetailDto extends AdminAiRequestListItemDto {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
}
