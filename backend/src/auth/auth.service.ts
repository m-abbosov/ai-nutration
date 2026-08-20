import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { createHash } from 'crypto';
import { FeatureAccessService } from '../common/feature-access/feature-access.service';
import { FeatureFlagsService } from '../common/feature-flags/feature-flags.service';
import { EnvConfig } from '../config/env.validation';
import { PrismaService } from '../database/prisma.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { toUserResponseDto } from '../users/users.mapper';
import { AuthResponseDto, TokenPairDto } from './dto/auth-response.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { GoogleProfilePayload } from './strategies/google.strategy';
import { isAuthDateFresh, verifyTelegramHash } from './telegram.util';

interface RefreshPayload {
  sub: string;
  type: 'refresh';
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly featureFlags: FeatureFlagsService,
    private readonly featureAccess: FeatureAccessService,
  ) {}

  private async issueTokenPair(userId: string): Promise<TokenPairDto> {
    const secret = this.configService.get('JWT_SECRET', { infer: true });
    const accessTtl = this.configService.get('JWT_ACCESS_TTL', {
      infer: true,
    });
    const refreshTtl = this.configService.get('JWT_REFRESH_TTL', {
      infer: true,
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, type: 'access' },
        { secret, expiresIn: accessTtl },
      ),
      this.jwtService.signAsync(
        { sub: userId, type: 'refresh' },
        { secret, expiresIn: refreshTtl },
      ),
    ]);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hashToken(refreshToken) },
    });

    return { accessToken, refreshToken };
  }

  private async buildAuthResponse(userId: string): Promise<AuthResponseDto> {
    const tokens = await this.issueTokenPair(userId);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const features = await this.featureAccess.getUserFeatures(userId);
    return { ...tokens, user: toUserResponseDto(user, features) };
  }

  /** Upserts a User by googleId (falling back to matching by email so a
   * user who previously signed in via Telegram/email can link Google).
   * Shared by both the regular login flow and the admin `state=admin`
   * branch — an admin's identity is the same Google-authenticated User row
   * (docs/ADMIN_PANEL.md, "RBAC model"). */
  private async resolveGoogleUser(
    profile: GoogleProfilePayload,
  ): Promise<User> {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user && profile.email) {
      user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.googleId },
        });
      }
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: profile.googleId,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
        },
      });
    }

    return user;
  }

  /** Upserts a User by googleId, then issues a token pair. Called from the
   * Google OAuth callback — this is the byte-for-byte-unchanged Phase 1
   * path (no `state` query param, or any `state` other than `'admin'`). */
  async loginWithGoogle(
    profile: GoogleProfilePayload,
  ): Promise<AuthResponseDto> {
    const user = await this.resolveGoogleUser(profile);
    return this.buildAuthResponse(user.id);
  }

  /** The `state=admin` OAuth callback branch (docs/ADMIN_API_CONTRACT.md,
   * "Auth"). Resolves/creates the same User row `loginWithGoogle` would,
   * but does NOT issue tokens itself — the caller (AuthController) decides
   * whether the resolved user is an admin and only then calls
   * `issueAdminSession`, so a non-admin's failed attempt never mints a
   * token pair or touches `refreshTokenHash`. */
  async resolveAdminGoogleUser(profile: GoogleProfilePayload): Promise<User> {
    return this.resolveGoogleUser(profile);
  }

  /** Issues a token pair for an already-confirmed admin and stamps
   * `lastLoginAt` (overwritten, never appended — see docs/ADMIN_PANEL.md,
   * "What's intentionally not built in Phase 2"). */
  async issueAdminSession(userId: string): Promise<TokenPairDto> {
    const tokens = await this.issueTokenPair(userId);
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
    return tokens;
  }

  async loginWithTelegram(dto: TelegramAuthDto): Promise<AuthResponseDto> {
    const telegramAuthEnabled = await this.featureFlags.isEnabled(
      'TELEGRAM_AUTH_ENABLED',
    );
    if (!telegramAuthEnabled) {
      throw new ServiceUnavailableException(
        'Telegram authentication is currently disabled',
      );
    }

    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN', {
      infer: true,
    });
    if (!botToken) {
      throw new ServiceUnavailableException('Telegram auth not configured');
    }

    if (!isAuthDateFresh(dto.auth_date)) {
      throw new UnauthorizedException('Telegram auth payload has expired');
    }

    if (!verifyTelegramHash(dto, botToken)) {
      throw new UnauthorizedException('Invalid Telegram authentication hash');
    }

    const telegramId = String(dto.id);
    const name = [dto.first_name, dto.last_name].filter(Boolean).join(' ');

    let user = await this.prisma.user.findUnique({ where: { telegramId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId,
          name: name || dto.username || `telegram_${telegramId}`,
          avatarUrl: dto.photo_url ?? null,
        },
      });
    } else if (dto.photo_url && dto.photo_url !== user.avatarUrl) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: dto.photo_url },
      });
    }

    return this.buildAuthResponse(user.id);
  }

  async refresh(refreshToken: string): Promise<TokenPairDto> {
    const secret = this.configService.get('JWT_SECRET', { infer: true });

    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(
        refreshToken,
        { secret },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (user.refreshTokenHash !== hashToken(refreshToken)) {
      // Token reuse/mismatch — proactively revoke to force re-login.
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: null },
      });
      throw new ForbiddenException('Refresh token has been revoked');
    }

    return this.issueTokenPair(user.id);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const features = await this.featureAccess.getUserFeatures(userId);
    return toUserResponseDto(user, features);
  }
}
