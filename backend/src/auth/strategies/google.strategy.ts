import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { EnvConfig } from '../../config/env.validation';

export interface GoogleProfilePayload {
  googleId: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
}

/**
 * Registered unconditionally so Nest can boot even when Google OAuth is not
 * configured (Phase 1 must still build/run in CI without third-party keys).
 * When GOOGLE_CLIENT_ID/SECRET are empty, passport-oauth2 requires
 * non-empty strings to construct, so placeholder values are substituted —
 * the actual `/auth/google` routes are gated by GoogleConfiguredGuard,
 * which returns a 503 before this strategy is ever exercised.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService<EnvConfig, true>) {
    const clientID =
      configService.get('GOOGLE_CLIENT_ID', { infer: true }) ||
      'unconfigured-google-client-id';
    const clientSecret =
      configService.get('GOOGLE_CLIENT_SECRET', { infer: true }) ||
      'unconfigured-google-client-secret';
    const callbackURL =
      configService.get('GOOGLE_CALLBACK_URL', { infer: true }) ||
      'http://localhost:3001/api/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value ?? null;
    const avatarUrl = profile.photos?.[0]?.value ?? null;
    const payload: GoogleProfilePayload = {
      googleId: profile.id,
      email,
      name: profile.displayName || email || 'Google user',
      avatarUrl,
    };
    done(null, payload as unknown as Express.User);
  }
}
