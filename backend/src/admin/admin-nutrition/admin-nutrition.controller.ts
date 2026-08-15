import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { RangeQueryDto } from '../common/range-query.dto';
import { AdminNutritionService } from './admin-nutrition.service';
import { AdminNutritionDto } from './dto/admin-nutrition.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/nutrition')
export class AdminNutritionController {
  constructor(private readonly adminNutritionService: AdminNutritionService) {}

  @Get()
  @RequirePermission('NUTRITION_READ')
  get(@Query() query: RangeQueryDto): Promise<AdminNutritionDto> {
    return this.adminNutritionService.getNutrition(query.range);
  }
}
