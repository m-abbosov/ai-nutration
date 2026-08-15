import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request } from 'express';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service';

/**
 * Global maintenance-mode enforcement for the `MAINTENANCE_MODE` feature
 * flag (docs/ADMIN_API_CONTRACT.md, Settings). Applied to every request via
 * `APP_GUARD`. `/api/health*` always stays reachable (so infra/uptime
 * checks aren't affected), and `/api/auth*` + `/api/admin*` always stay
 * reachable too — otherwise an admin could never log in to flip the flag
 * back off, a self-lockout mirroring the one guarded against in
 * admin-team's self-demotion check. Every other route (meals, chat,
 * nutrition, dashboard, recommendations, users) is blocked with `503` while
 * the flag is on.
 */
@Injectable()
export class MaintenanceModeGuard implements CanActivate {
  private static readonly ALWAYS_ALLOWED_PREFIXES = [
    '/api/health',
    '/api/auth',
    '/api/admin',
  ];

  constructor(private readonly featureFlags: FeatureFlagsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path ?? request.url;

    if (
      MaintenanceModeGuard.ALWAYS_ALLOWED_PREFIXES.some((prefix) =>
        path.startsWith(prefix),
      )
    ) {
      return true;
    }

    const maintenanceOn = await this.featureFlags.isEnabled('MAINTENANCE_MODE');
    if (maintenanceOn) {
      throw new ServiceUnavailableException(
        'NutriAI is currently undergoing maintenance. Please try again shortly.',
      );
    }
    return true;
  }
}
