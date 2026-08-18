import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { formatDateOnly } from '../../common/date.util';
import { PrismaService } from '../../database/prisma.service';
import { PaginatedDto, paginationParams } from '../common/pagination.dto';
import { currentWindow, eachDate, parseRange } from '../common/range.util';
import {
  AdminCalculatorOverviewDto,
  AdminCalculatorUsageListItemDto,
} from './dto/admin-calculators.dto';
import { FindCalculatorUsageQueryDto } from './dto/find-calculator-usage-query.dto';

@Injectable()
export class AdminCalculatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(
    rangeParam: string | undefined,
  ): Promise<AdminCalculatorOverviewDto> {
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

    const [totalUsage, perCalculator, perUser, perDayRows] = await Promise.all([
      this.prisma.calculatorUsageLog.count({
        where: { createdAt: { gte, lt } },
      }),
      this.prisma.calculatorUsageLog.groupBy({
        by: ['calculatorId'],
        where: { createdAt: { gte, lt } },
        _count: true,
        orderBy: { _count: { calculatorId: 'desc' } },
      }),
      this.prisma.calculatorUsageLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte, lt }, userId: { not: null } },
        _count: true,
      }),
      this.prisma.$queryRaw<{ day: Date; count: bigint }[]>(Prisma.sql`
        SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*) AS count
        FROM calculator_usage_logs
        WHERE "createdAt" >= ${gte} AND "createdAt" < ${lt}
        GROUP BY 1
        ORDER BY 1
      `),
    ]);

    const perDayMap = new Map<string, number>();
    for (const row of perDayRows)
      perDayMap.set(formatDateOnly(row.day), Number(row.count));
    const usagePerDay = eachDate(window).map((date) => ({
      date,
      value: perDayMap.get(date) ?? 0,
    }));

    return {
      totalUsage,
      uniqueUsers: perUser.length,
      usagePerDay,
      usagePerCalculator: perCalculator.map((row) => ({
        calculatorId: row.calculatorId,
        count: row._count,
      })),
    };
  }

  async listUsage(
    query: FindCalculatorUsageQueryDto,
  ): Promise<PaginatedDto<AdminCalculatorUsageListItemDto>> {
    const { page, pageSize, skip, take } = paginationParams(query);

    const where: Prisma.CalculatorUsageLogWhereInput = {};
    if (query.calculatorId) where.calculatorId = query.calculatorId;
    if (query.userId) where.userId = query.userId;
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.calculatorUsageLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { user: { select: { name: true } } },
      }),
      this.prisma.calculatorUsageLog.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        createdAt: row.createdAt.toISOString(),
        calculatorId: row.calculatorId,
        userName: row.user?.name ?? null,
        inputs: row.inputs as Record<string, unknown>,
        result: row.result as Record<string, unknown>,
      })),
      total,
      page,
      pageSize,
    };
  }
}
