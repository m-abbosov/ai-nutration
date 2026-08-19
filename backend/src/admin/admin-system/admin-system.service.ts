import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaginatedDto, paginationParams } from '../common/pagination.dto';
import {
  AdminSystemHealthDto,
  AdminSystemLogItemDto,
  HealthStatus,
} from './dto/admin-system.dto';
import { FindSystemLogsQueryDto } from './dto/find-system-logs-query.dto';

const AI_RECENT_WINDOW_MS = 15 * 60 * 1000;
const AI_RECENT_SAMPLE_SIZE = 50;

@Injectable()
export class AdminSystemService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<AdminSystemHealthDto> {
    const apiStart = Date.now();
    // Self-timed no-op: measures event-loop/response overhead only, no I/O.
    const apiLatencyMs = Date.now() - apiStart;

    let dbStatus: HealthStatus = 'HEALTHY';
    let dbLatencyMs: number;
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = dbLatencyMs > 500 ? 'WARNING' : 'HEALTHY';
    } catch {
      dbLatencyMs = Date.now() - dbStart;
      dbStatus = 'ERROR';
    }

    // Mirrors `database` — the process's own DB reachability is the only
    // thing this auth subsystem depends on (no separate auth store).
    const authStatus: HealthStatus = dbStatus === 'ERROR' ? 'ERROR' : 'HEALTHY';

    const recentAi = await this.prisma.aiRequestLog.findMany({
      where: { createdAt: { gte: new Date(Date.now() - AI_RECENT_WINDOW_MS) } },
      orderBy: { createdAt: 'desc' },
      take: AI_RECENT_SAMPLE_SIZE,
      select: { status: true },
    });
    let aiStatus: HealthStatus | 'UNKNOWN';
    if (recentAi.length === 0) {
      aiStatus = 'UNKNOWN';
    } else {
      const successRatio =
        recentAi.filter((r) => r.status === 'SUCCESS').length / recentAi.length;
      aiStatus =
        successRatio >= 0.9
          ? 'HEALTHY'
          : successRatio >= 0.5
            ? 'WARNING'
            : 'ERROR';
    }

    return {
      api: { status: 'HEALTHY', latencyMs: apiLatencyMs },
      database: { status: dbStatus, latencyMs: dbLatencyMs },
      auth: { status: authStatus },
      ai: { status: aiStatus },
    };
  }

  async listLogs(
    query: FindSystemLogsQueryDto,
  ): Promise<PaginatedDto<AdminSystemLogItemDto>> {
    const { page, pageSize, skip, take } = paginationParams(query);

    const where: Prisma.SystemLogWhereInput = {};
    if (query.severity) where.severity = query.severity;
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }
    if (query.search) {
      where.message = { contains: query.search, mode: 'insensitive' };
    }

    const [rows, total] = await Promise.all([
      this.prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.systemLog.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        severity: row.severity,
        service: row.service,
        message: row.message,
        requestId: row.requestId,
        statusCode: row.statusCode,
        stack: row.stack,
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }
}
