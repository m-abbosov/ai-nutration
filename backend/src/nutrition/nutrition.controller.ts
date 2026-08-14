import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NutritionDailyQueryDto } from './dto/nutrition-daily-query.dto';
import {
  NutritionDailyDto,
  NutritionWeeklyPointDto,
} from './dto/nutrition-response.dto';
import { NutritionWeeklyQueryDto } from './dto/nutrition-weekly-query.dto';
import { NutritionService } from './nutrition.service';

@UseGuards(JwtAuthGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('daily')
  getDaily(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NutritionDailyQueryDto,
  ): Promise<NutritionDailyDto> {
    return this.nutritionService.getDaily(user.id, query.date);
  }

  @Get('weekly')
  getWeekly(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: NutritionWeeklyQueryDto,
  ): Promise<NutritionWeeklyPointDto[]> {
    return this.nutritionService.getWeekly(user.id, query.days);
  }
}
