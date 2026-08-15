import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsDto } from './dto/admin-settings.dto';
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';

@UseGuards(JwtAuthGuard, AdminAuthGuard, AdminPermissionGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  // Any admin — no specific permission required.
  @Get()
  getSettings(): Promise<AdminSettingsDto> {
    return this.adminSettingsService.getSettings();
  }

  @Patch('feature-flags/:key')
  @RequirePermission('SETTINGS_MANAGE')
  setFeatureFlag(
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
    @CurrentUser() admin: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<AdminSettingsDto['featureFlags'][number]> {
    return this.adminSettingsService.setFeatureFlag(
      key,
      dto.enabled,
      admin.id,
      req.ip ?? null,
    );
  }
}
