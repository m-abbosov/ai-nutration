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
import { FindSystemErrorsQueryDto } from './dto/find-system-errors-query.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/system')
export class AdminSystemController {
  constructor(private readonly adminSystemService: AdminSystemService) {}

  @Get('health')
  @RequirePermission('SYSTEM_READ')
  health(): Promise<AdminSystemHealthDto> {
    return this.adminSystemService.getHealth();
  }

  @Get('errors')
  @RequirePermission('SYSTEM_READ')
  errors(
    @Query() query: FindSystemErrorsQueryDto,
  ): Promise<PaginatedDto<AdminSystemLogItemDto>> {
    return this.adminSystemService.listErrors(query);
  }
}
