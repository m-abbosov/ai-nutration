import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NutritionDailyQueryDto } from '../nutrition/dto/nutrition-daily-query.dto';
import { DashboardResponseDto, DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NutritionDailyQueryDto,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard(user.id, query.date);
  }
}
