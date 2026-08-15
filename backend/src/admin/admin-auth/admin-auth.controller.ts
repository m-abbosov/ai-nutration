import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { AdminAuthService } from './admin-auth.service';
import { AdminMeDto } from './dto/admin-me.dto';

// GET /admin/auth/me — any admin, no specific permission required beyond
// AdminAuthGuard's adminRoleId/adminActive check.
@UseGuards(JwtAuthGuard, AdminAuthGuard)
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser): Promise<AdminMeDto> {
    return this.adminAuthService.getMe(user.id);
  }
}
