import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PaginatedDto, paginationParams } from '../admin/common/pagination.dto';
import { PrismaService } from '../database/prisma.service';
import { AuditLogItemDto } from './dto/audit-log-item.dto';
import { FindAuditLogsQueryDto } from './dto/find-audit-logs-query.dto';

export interface RecordAuditLogParams {
  adminId: string;
  action: AuditAction;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
}

/**
 * `AuditLog` writer used by every admin-* module and the admin branch of the
 * Google OAuth callback (see docs/ADMIN_PANEL.md, "Audit log"). A failure to
 * write an audit row is logged server-side but never blocks the admin
 * action it's recording — the action already happened by the time we log
 * it, so throwing here would only turn a successful admin operation into a
 * confusing 500.
 */
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(params: RecordAuditLogParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: params.adminId,
          action: params.action,
          targetType: params.targetType ?? null,
          targetId: params.targetId ?? null,
          metadata: params.metadata ?? Prisma.JsonNull,
          ipAddress: params.ipAddress ?? null,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to write AuditLog (${params.action}): ${(err as Error).message}`,
      );
    }
  }

  async list(
    query: FindAuditLogsQueryDto,
  ): Promise<PaginatedDto<AuditLogItemDto>> {
    const { page, pageSize, skip, take } = paginationParams(query);

    const where: Prisma.AuditLogWhereInput = {};
    if (query.adminId) where.adminId = query.adminId;
    if (query.action) where.action = query.action;
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { admin: { select: { name: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        adminName: row.admin.name,
        action: row.action,
        targetType: row.targetType,
        targetId: row.targetId,
        metadata: row.metadata,
        ipAddress: row.ipAddress,
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }
}
