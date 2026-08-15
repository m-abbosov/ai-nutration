import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAnalyticsDto } from './dto/admin-analytics.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get()
  @RequirePermission('ANALYTICS_READ')
  get(@Query() query: AnalyticsQueryDto): Promise<AdminAnalyticsDto> {
    return this.adminAnalyticsService.getAnalytics(query);
  }
}
