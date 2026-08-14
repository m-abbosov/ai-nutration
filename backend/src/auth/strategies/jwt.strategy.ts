import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvConfig } from '../../config/env.validation';
import { AuthenticatedUser } from '../types/authenticated-user';

export interface JwtAccessPayload {
  sub: string;
  type: 'access';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<EnvConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    });
  }

  // Only accepts access tokens — refresh tokens carry type: 'refresh' and are
  // validated separately in AuthService.refresh, never through this guard,
  // so a leaked refresh token cannot be replayed as an access token.
  validate(payload: JwtAccessPayload): AuthenticatedUser {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    return { id: payload.sub };
  }
}
