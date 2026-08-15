import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { Request } from 'express';
import { EnvConfig } from '../../config/env.validation';
import { FeatureFlagsService } from '../../common/feature-flags/feature-flags.service';

/**
 * Wraps the passport 'google' guard: returns a clear 503 when Google OAuth
 * credentials are not configured, or when the `GOOGLE_AUTH_ENABLED` feature
 * flag is off, instead of letting passport-oauth2 fail with an opaque error
 * (or, worse, attempt a request with placeholder credentials).
 *
 * Also forwards an incoming `?state=` query param through to
 * passport-oauth2's authorize redirect (`getAuthenticateOptions`), which is
 * how the admin panel's `state=admin` branch rides the existing OAuth round
 * trip (docs/ADMIN_PANEL.md). When no `state` is present — the entire
 * Phase 1 login flow — this returns `undefined`, so passport-oauth2 omits
 * the `state` param exactly as it did before this guard existed: the
 * no-`state` path is byte-for-byte unchanged.
 */
@Injectable()
export class GoogleConfiguredGuard extends AuthGuard('google') {
  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly featureFlags: FeatureFlagsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID', {
      infer: true,
    });
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET', {
      infer: true,
    });
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Google auth not configured');
    }

    const enabled = await this.featureFlags.isEnabled('GOOGLE_AUTH_ENABLED');
    if (!enabled) {
      throw new ServiceUnavailableException(
        'Google authentication is currently disabled',
      );
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  getAuthenticateOptions(
    context: ExecutionContext,
  ): IAuthModuleOptions | undefined {
    const request = context.switchToHttp().getRequest<Request>();
    const state = request.query?.state;
    if (typeof state === 'string' && state.length > 0) {
      return { state } as IAuthModuleOptions;
    }
    return undefined;
  }
}
