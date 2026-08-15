import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminPermissionGuard } from '../../common/guards/admin-permission.guard';
import { RequirePermission } from '../../common/guards/require-permission.decorator';
import { PaginatedDto } from '../common/pagination.dto';
import { AdminConversationsService } from './admin-conversations.service';
import {
  AdminConversationDetailDto,
  AdminConversationListItemDto,
} from './dto/admin-conversation.dto';
import { FindConversationsQueryDto } from './dto/find-conversations-query.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/conversations')
export class AdminConversationsController {
  constructor(
    private readonly adminConversationsService: AdminConversationsService,
  ) {}

  // Metadata-only list — deliberately NOT gated behind CONVERSATIONS_READ
  // (docs/ADMIN_API_CONTRACT.md): only the detail route below, which
  // exposes message content, requires that permission.
  @Get()
  list(
    @Query() query: FindConversationsQueryDto,
  ): Promise<PaginatedDto<AdminConversationListItemDto>> {
    return this.adminConversationsService.list(query);
  }

  @Get(':id')
  @RequirePermission('CONVERSATIONS_READ')
  detail(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AdminConversationDetailDto> {
    return this.adminConversationsService.detail(id, admin.id, req.ip ?? null);
  }
}
