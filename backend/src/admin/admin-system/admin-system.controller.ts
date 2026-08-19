import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { PaginatedDto } from '../common/pagination.dto';
import { AdminSystemService } from './admin-system.service';
import {
  AdminSystemHealthDto,
  AdminSystemLogItemDto,
} from './dto/admin-system.dto';
import { FindSystemLogsQueryDto } from './dto/find-system-logs-query.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/system')
export class AdminSystemController {
  constructor(private readonly adminSystemService: AdminSystemService) {}

  @Get('health')
  @RequirePermission('SYSTEM_READ')
  health(): Promise<AdminSystemHealthDto> {
    return this.adminSystemService.getHealth();
  }

  @Get('logs')
  @RequirePermission('SYSTEM_READ')
  logs(
    @Query() query: FindSystemLogsQueryDto,
  ): Promise<PaginatedDto<AdminSystemLogItemDto>> {
    return this.adminSystemService.listLogs(query);
  }
}
