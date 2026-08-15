import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { RangeQueryDto } from '../common/range-query.dto';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardDto } from './dto/admin-dashboard.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  @RequirePermission('DASHBOARD_READ')
  get(@Query() query: RangeQueryDto): Promise<AdminDashboardDto> {
    return this.adminDashboardService.getDashboard(query.range);
  }
}
