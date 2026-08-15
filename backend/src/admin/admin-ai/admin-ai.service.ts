import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { formatDateOnly } from '../../common/date.util';
import { PrismaService } from '../../database/prisma.service';
import { PaginatedDto, paginationParams } from '../common/pagination.dto';
import { currentWindow, eachDate, parseRange } from '../common/range.util';
import {
  AdminAiOverviewDto,
  AdminAiRequestDetailDto,
  AdminAiRequestListItemDto,
} from './dto/admin-ai.dto';
import { FindAiRequestsQueryDto } from './dto/find-ai-requests-query.dto';

@Injectable()
export class AdminAiService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(
    rangeParam: string | undefined,
  ): Promise<AdminAiOverviewDto> {
    const range = parseRange(rangeParam);
    const window = currentWindow(range);
    const gte = new Date(
      Date.UTC(
        window.start.getUTCFullYear(),
        window.start.getUTCMonth(),
        window.start.getUTCDate(),
      ),
    );
    const lt = new Date(
      Date.UTC(
        window.end.getUTCFullYear(),
        window.end.getUTCMonth(),
        window.end.getUTCDate() + 1,
      ),
    );

    const [
      total,
      successCount,
      failureCount,
      avgAgg,
      tokenAgg,
      perEndpoint,
      perDayRows,
    ] = await Promise.all([
      this.prisma.aiRequestLog.count({ where: { createdAt: { gte, lt } } }),
      this.prisma.aiRequestLog.count({
        where: { createdAt: { gte, lt }, status: 'SUCCESS' },
      }),
      this.prisma.aiRequestLog.count({
        where: { createdAt: { gte, lt }, status: 'ERROR' },
      }),
      this.prisma.aiRequestLog.aggregate({
        where: { createdAt: { gte, lt } },
        _avg: { responseTimeMs: true },
      }),
      this.prisma.aiRequestLog.aggregate({
        where: { createdAt: { gte, lt } },
        _sum: { promptTokens: true, completionTokens: true, totalTokens: true },
      }),
      this.prisma.aiRequestLog.groupBy({
        by: ['endpoint'],
        where: { createdAt: { gte, lt } },
        _count: true,
      }),
      this.prisma.$queryRaw<{ day: Date; count: bigint }[]>(Prisma.sql`
        SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*) AS count
        FROM ai_request_logs
        WHERE "createdAt" >= ${gte} AND "createdAt" < ${lt}
        GROUP BY 1
        ORDER BY 1
      `),
    ]);

    const perDayMap = new Map<string, number>();
    for (const row of perDayRows)
      perDayMap.set(formatDateOnly(row.day), Number(row.count));
    const requestsPerDay = eachDate(window).map((date) => ({
      date,
      value: perDayMap.get(date) ?? 0,
    }));

    const tokenUsage =
      tokenAgg._sum.promptTokens == null &&
      tokenAgg._sum.completionTokens == null &&
      tokenAgg._sum.totalTokens == null
        ? null
        : {
            promptTokens: tokenAgg._sum.promptTokens ?? 0,
            completionTokens: tokenAgg._sum.completionTokens ?? 0,
            totalTokens: tokenAgg._sum.totalTokens ?? 0,
          };

    return {
      requests: total,
      successCount,
      failureCount,
      errorRatePct:
        total > 0 ? Math.round((failureCount / total) * 1000) / 10 : 0,
      avgResponseTimeMs: Math.round(avgAgg._avg.responseTimeMs ?? 0),
      requestsPerDay,
      requestsPerEndpoint: perEndpoint.map((row) => ({
        endpoint: row.endpoint,
        count: row._count,
      })),
      tokenUsage,
    };
  }

  async listRequests(
    query: FindAiRequestsQueryDto,
  ): Promise<PaginatedDto<AdminAiRequestListItemDto>> {
    const { page, pageSize, skip, take } = paginationParams(query);

    const where: Prisma.AiRequestLogWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.endpoint) where.endpoint = query.endpoint;
    if (query.userId) where.userId = query.userId;
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.aiRequestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { user: { select: { name: true } } },
      }),
      this.prisma.aiRequestLog.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt.toISOString(),
        userName: row.user?.name ?? null,
        endpoint: row.endpoint,
        provider: row.provider,
        model: row.model,
        status: row.status,
        responseTimeMs: row.responseTimeMs,
        errorReason: row.errorReason,
      })),
      total,
      page,
      pageSize,
    };
  }

  async getRequestDetail(id: string): Promise<AdminAiRequestDetailDto> {
    const row = await this.prisma.aiRequestLog.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });
    if (!row) throw new NotFoundException('AI request log not found');

    return {
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      userName: row.user?.name ?? null,
      endpoint: row.endpoint,
      provider: row.provider,
      model: row.model,
      status: row.status,
      responseTimeMs: row.responseTimeMs,
      errorReason: row.errorReason,
      promptTokens: row.promptTokens,
      completionTokens: row.completionTokens,
      totalTokens: row.totalTokens,
    };
  }
}
