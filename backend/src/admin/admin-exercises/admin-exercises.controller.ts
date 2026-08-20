import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { PaginatedDto } from '../common/pagination.dto';
import { AdminExercisesService } from './admin-exercises.service';
import { AdminExerciseDetailDto, AdminExerciseListItemDto, CreateExerciseDto, ListAdminExercisesQueryDto, UpdateExerciseDto } from './dto/admin-exercise.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/exercises')
export class AdminExercisesController {
  constructor(private readonly adminExercisesService: AdminExercisesService) {}

  @Get()
  @RequirePermission('FITNESS_READ')
  list(@Query() query: ListAdminExercisesQueryDto): Promise<PaginatedDto<AdminExerciseListItemDto>> {
    return this.adminExercisesService.list(query);
  }

  @Get(':id')
  @RequirePermission('FITNESS_READ')
  detail(@Param('id') id: string): Promise<AdminExerciseDetailDto> {
    return this.adminExercisesService.detail(id);
  }

  @Post()
  @RequirePermission('FITNESS_MANAGE')
  create(@Body() dto: CreateExerciseDto, @CurrentUser() admin: AuthenticatedUser, @Req() req: Request): Promise<AdminExerciseDetailDto> {
    return this.adminExercisesService.create(dto, admin.id, req.ip ?? null);
  }

  @Patch(':id')
  @RequirePermission('FITNESS_MANAGE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseDto,
    @CurrentUser() admin: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AdminExerciseDetailDto> {
    return this.adminExercisesService.update(id, dto, admin.id, req.ip ?? null);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('FITNESS_MANAGE')
  remove(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser, @Req() req: Request): Promise<void> {
    return this.adminExercisesService.remove(id, admin.id, req.ip ?? null);
  }
}
