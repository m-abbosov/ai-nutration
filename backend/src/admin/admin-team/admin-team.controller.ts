import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { AdminTeamService } from './admin-team.service';
import { AdminTeamDetailDto, AdminTeamListItemDto } from './dto/admin-team.dto';
import { PromoteAdminDto } from './dto/promote-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

// Named admin-team internally to avoid confusion with admin-users, but the
// ROUTE stays /admin/admin-users per docs/ADMIN_PANEL.md.
@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/admin-users')
export class AdminTeamController {
  constructor(private readonly adminTeamService: AdminTeamService) {}

  @Get()
  @RequirePermission('ADMIN_USERS_READ')
  list(): Promise<AdminTeamListItemDto[]> {
    return this.adminTeamService.list();
  }

  @Post()
  @RequirePermission('ADMIN_USERS_MANAGE')
  promote(
    @Body() dto: PromoteAdminDto,
    @CurrentUser() admin: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AdminTeamListItemDto> {
    return this.adminTeamService.promote(dto, admin.id, req.ip ?? null);
  }

  @Get(':id')
  @RequirePermission('ADMIN_USERS_READ')
  detail(@Param('id') id: string): Promise<AdminTeamDetailDto> {
    return this.adminTeamService.detail(id);
  }

  @Patch(':id')
  @RequirePermission('ADMIN_USERS_MANAGE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentUser() admin: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AdminTeamListItemDto> {
    return this.adminTeamService.update(id, dto, admin.id, req.ip ?? null);
  }
}
