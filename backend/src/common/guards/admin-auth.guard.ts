import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';

/**
 * Runs after `JwtAuthGuard`. Rejects anyone who isn't `adminRoleId != null &&
 * adminActive` — cheaply, from the already-loaded JWT user (see
 * `JwtStrategy.validate`), no extra query. Per docs/ADMIN_API_CONTRACT.md,
 * denial is `403 { message: "Not an admin" }`.
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user || user.adminRoleId == null || !user.adminActive) {
      throw new ForbiddenException('Not an admin');
    }
    return true;
  }
}
