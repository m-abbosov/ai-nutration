import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuditLogService } from '../audit/audit-log.service';
import { EnvConfig } from '../config/env.validation';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto, TokenPairDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { GoogleConfiguredGuard } from './guards/google-configured.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleProfilePayload } from './strategies/google.strategy';
import { AuthenticatedUser } from './types/authenticated-user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly auditLogService: AuditLogService,
  ) {}

  // Initiates the Google OAuth consent flow. GoogleConfiguredGuard both
  // gates on config/GOOGLE_AUTH_ENABLED and, when configured, hands off to
  // passport's redirect — forwarding `?state=admin` through to Google when
  // present (see GoogleConfiguredGuard.getAuthenticateOptions).
  @Get('google')
  @UseGuards(GoogleConfiguredGuard)
  googleAuth(): void {
    // Handled entirely by passport-google-oauth20's redirect.
  }

  @Get('google/callback')
  @UseGuards(GoogleConfiguredGuard)
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const profile = req.user as GoogleProfilePayload;
    const state =
      typeof req.query.state === 'string' ? req.query.state : undefined;

    // Admin panel login (docs/ADMIN_API_CONTRACT.md, "Auth"). Kept as an
    // isolated branch so the code path below — Phase 1's regular login —
    // is untouched byte-for-byte for every request where `state` is absent
    // or anything other than exactly `'admin'`.
    if (state === 'admin') {
      await this.handleAdminGoogleCallback(profile, req, res);
      return;
    }

    const { accessToken, refreshToken } =
      await this.authService.loginWithGoogle(profile);

    const frontendUrl = this.configService.get('FRONTEND_URL', {
      infer: true,
    });
    const redirectUrl = new URL('/auth/callback', frontendUrl);
    redirectUrl.searchParams.set('token', accessToken);
    redirectUrl.searchParams.set('refresh', refreshToken);
    res.redirect(redirectUrl.toString());
  }

  private async handleAdminGoogleCallback(
    profile: GoogleProfilePayload,
    req: Request,
    res: Response,
  ): Promise<void> {
    const adminFrontendUrl = this.configService.get('ADMIN_FRONTEND_URL', {
      infer: true,
    });
    const redirectUrl = new URL('/auth/callback', adminFrontendUrl);

    const user = await this.authService.resolveAdminGoogleUser(profile);
    const isAdmin = user.adminRoleId != null && user.adminActive;

    if (!isAdmin) {
      await this.auditLogService.record({
        adminId: user.id,
        action: 'ADMIN_LOGIN_DENIED',
        targetType: 'User',
        targetId: user.id,
        ipAddress: req.ip,
      });
      redirectUrl.searchParams.set('error', 'not_admin');
      res.redirect(redirectUrl.toString());
      return;
    }

    const { accessToken, refreshToken } =
      await this.authService.issueAdminSession(user.id);
    await this.auditLogService.record({
      adminId: user.id,
      action: 'ADMIN_LOGIN',
      ipAddress: req.ip,
    });
    redirectUrl.searchParams.set('token', accessToken);
    redirectUrl.searchParams.set('refresh', refreshToken);
    res.redirect(redirectUrl.toString());
  }

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  loginWithTelegram(@Body() dto: TelegramAuthDto): Promise<AuthResponseDto> {
    return this.authService.loginWithTelegram(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto): Promise<TokenPairDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.authService.logout(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.authService.me(user.id);
  }
}
