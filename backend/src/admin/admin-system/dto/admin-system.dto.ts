import { SystemLogSeverity } from '@prisma/client';

export type HealthStatus = 'HEALTHY' | 'WARNING' | 'ERROR';

export interface AdminSystemHealthDto {
  api: { status: HealthStatus; latencyMs: number };
  database: { status: HealthStatus; latencyMs: number };
  auth: { status: HealthStatus };
  ai: { status: HealthStatus | 'UNKNOWN' };
}

export interface AdminSystemLogItemDto {
  id: string;
  severity: SystemLogSeverity;
  service: string;
  message: string;
  requestId: string | null;
  statusCode: number | null;
  stack: string | null;
  createdAt: string;
}
