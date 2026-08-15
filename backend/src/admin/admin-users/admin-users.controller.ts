import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
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
import { PaginatedDto } from '../common/pagination.dto';
import { AdminUsersService } from './admin-users.service';
import { AdminUserDetailDto, AdminUserListItemDto } from './dto/admin-user.dto';
import { FindAdminUsersQueryDto } from './dto/find-admin-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @RequirePermission('USERS_READ')
  list(
    @Query() query: FindAdminUsersQueryDto,
  ): Promise<PaginatedDto<AdminUserListItemDto>> {
    return this.adminUsersService.list(query);
  }

  @Get(':id')
  @RequirePermission('USERS_READ')
  detail(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AdminUserDetailDto> {
    return this.adminUsersService.detail(id, admin.id, req.ip ?? null);
  }

  @Patch(':id/status')
  @RequirePermission('USERS_DISABLE')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<{ id: string; status: 'ACTIVE' | 'DISABLED' }> {
    return this.adminUsersService.updateStatus(
      id,
      dto.status,
      admin.id,
      req.ip ?? null,
    );
  }
}
