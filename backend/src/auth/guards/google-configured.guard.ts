import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { EnvConfig } from '../../config/env.validation';

/**
 * Wraps the passport 'google' guard: returns a clear 503 when Google OAuth
 * credentials are not configured, instead of letting passport-oauth2 fail
 * with an opaque error (or, worse, attempt a request with placeholder
 * credentials).
 */
@Injectable()
export class GoogleConfiguredGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID', {
      infer: true,
    });
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET', {
      infer: true,
    });
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Google auth not configured');
    }
    return super.canActivate(context);
  }
}
