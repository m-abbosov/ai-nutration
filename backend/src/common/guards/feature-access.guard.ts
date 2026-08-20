import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { FeatureAccessService } from '../feature-access/feature-access.service';
import { REQUIRE_FEATURE_KEY } from './require-feature.decorator';

/** Runs after JwtAuthGuard. Handlers with no `@RequireFeature` pass through
 * untouched. 403s with a stable reason string the frontend can key off of
 * (distinct from a generic 403) so it can render "not available yet" rather
 * than a raw error. */
@Injectable()
export class FeatureAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureAccess: FeatureAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string | undefined>(REQUIRE_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser;

    const allowed = await this.featureAccess.hasFeature(user.id, required);
    if (!allowed) {
      throw new ForbiddenException({ message: `Feature not enabled: ${required}`, reason: 'FEATURE_NOT_ENABLED' });
    }
    return true;
  }
}
