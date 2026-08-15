import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { PaginatedDto } from '../common/pagination.dto';
import { RangeQueryDto } from '../common/range-query.dto';
import { AdminAiService } from './admin-ai.service';
import {
  AdminAiOverviewDto,
  AdminAiRequestDetailDto,
  AdminAiRequestListItemDto,
} from './dto/admin-ai.dto';
import { FindAiRequestsQueryDto } from './dto/find-ai-requests-query.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/ai')
export class AdminAiController {
  constructor(private readonly adminAiService: AdminAiService) {}

  @Get('overview')
  @RequirePermission('AI_READ')
  overview(@Query() query: RangeQueryDto): Promise<AdminAiOverviewDto> {
    return this.adminAiService.getOverview(query.range);
  }

  @Get('requests')
  @RequirePermission('AI_LOGS_READ')
  listRequests(
    @Query() query: FindAiRequestsQueryDto,
  ): Promise<PaginatedDto<AdminAiRequestListItemDto>> {
    return this.adminAiService.listRequests(query);
  }

  @Get('requests/:id')
  @RequirePermission('AI_LOGS_READ')
  requestDetail(@Param('id') id: string): Promise<AdminAiRequestDetailDto> {
    return this.adminAiService.getRequestDetail(id);
  }
}
