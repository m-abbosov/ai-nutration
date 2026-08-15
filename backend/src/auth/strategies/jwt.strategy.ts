import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfig } from '../../config/env.validation';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedUser } from '../types/authenticated-user';

export interface JwtAccessPayload {
  sub: string;
  type: 'access';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<EnvConfig, true>,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    });
  }

  // Only accepts access tokens — refresh tokens carry type: 'refresh' and are
  // validated separately in AuthService.refresh, never through this guard,
  // so a leaked refresh token cannot be replayed as an access token.
  //
  // Loads the current status/admin fields from the DB on every request (a
  // small added query, Phase 2): a `DISABLED` user's token is rejected here
  // (docs/ADMIN_PANEL.md, "Existing modules touched") and `adminRoleId`/
  // `adminActive` are attached to `request.user` so AdminAuthGuard can
  // decide without a second query.
  async validate(payload: JwtAccessPayload): Promise<AuthenticatedUser> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        status: true,
        adminRoleId: true,
        adminActive: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.status === 'DISABLED') {
      throw new UnauthorizedException('Account disabled');
    }

    return {
      id: user.id,
      status: user.status,
      adminRoleId: user.adminRoleId,
      adminActive: user.adminActive,
    };
  }
}
