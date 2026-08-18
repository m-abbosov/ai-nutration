import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { PaginatedDto } from '../common/pagination.dto';
import { RangeQueryDto } from '../common/range-query.dto';
import { AdminCalculatorsService } from './admin-calculators.service';
import {
  AdminCalculatorOverviewDto,
  AdminCalculatorUsageListItemDto,
} from './dto/admin-calculators.dto';
import { FindCalculatorUsageQueryDto } from './dto/find-calculator-usage-query.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/calculators')
export class AdminCalculatorsController {
  constructor(
    private readonly adminCalculatorsService: AdminCalculatorsService,
  ) {}

  @Get('overview')
  @RequirePermission('ANALYTICS_READ')
  overview(@Query() query: RangeQueryDto): Promise<AdminCalculatorOverviewDto> {
    return this.adminCalculatorsService.getOverview(query.range);
  }

  @Get('usage')
  @RequirePermission('ANALYTICS_READ')
  listUsage(
    @Query() query: FindCalculatorUsageQueryDto,
  ): Promise<PaginatedDto<AdminCalculatorUsageListItemDto>> {
    return this.adminCalculatorsService.listUsage(query);
  }
}
