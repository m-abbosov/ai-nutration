import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
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
    return { ...tokens, user: toUserResponseDto(user) };
  }

  /** Upserts a User by googleId (falling back to matching by email so a
   * user who previously signed in via Telegram/email can link Google),
   * then issues a token pair. Called from the Google OAuth callback. */
  async loginWithGoogle(
    profile: GoogleProfilePayload,
  ): Promise<AuthResponseDto> {
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

    return this.buildAuthResponse(user.id);
  }

  async loginWithTelegram(dto: TelegramAuthDto): Promise<AuthResponseDto> {
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
    return toUserResponseDto(user);
  }
}
