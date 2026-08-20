import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { RangeQueryDto } from '../common/range-query.dto';
import { AdminFitnessService } from './admin-fitness.service';
import { AdminFitnessDto } from './dto/admin-fitness.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/fitness')
export class AdminFitnessController {
  constructor(private readonly adminFitnessService: AdminFitnessService) {}

  @Get()
  @RequirePermission('FITNESS_READ')
  get(@Query() query: RangeQueryDto): Promise<AdminFitnessDto> {
    return this.adminFitnessService.getFitness(query.range);
  }
}
