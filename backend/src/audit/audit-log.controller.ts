import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaginatedDto } from '../admin/common/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../common/guards/admin-permission.guard';
import { RequirePermission } from '../common/guards/require-permission.decorator';
import { AuditLogService } from './audit-log.service';
import { AuditLogItemDto } from './dto/audit-log-item.dto';
import { FindAuditLogsQueryDto } from './dto/find-audit-logs-query.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @RequirePermission('AUDIT_LOGS_READ')
  list(
    @Query() query: FindAuditLogsQueryDto,
  ): Promise<PaginatedDto<AuditLogItemDto>> {
    return this.auditLogService.list(query);
  }
}
