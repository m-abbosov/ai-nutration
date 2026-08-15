import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminPermissionKey } from '@prisma/client';
import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { PrismaService } from '../../database/prisma.service';
import { REQUIRE_PERMISSION_KEY } from './require-permission.decorator';

// Request-scoped cache of a role's permission set, so a request touching
// multiple guards (or, in future, an interceptor that also needs
// permissions) only pays for the AdminRolePermission join once. Keyed by
// the request object itself, so entries are naturally garbage-collected
// once the request completes — no manual cleanup needed.
const roleGrantsCache = new WeakMap<
  Request,
  Promise<Set<AdminPermissionKey>>
>();

/**
 * Runs after `AdminAuthGuard`. When the handler carries `@RequirePermission`,
 * loads the current admin's role permissions (joined through
 * `AdminRolePermission`) and 403s if the required key isn't granted. Routes
 * with no `@RequirePermission` (e.g. `GET /admin/auth/me`, `GET
 * /admin/settings` — "any admin") pass through once `AdminAuthGuard` has
 * already confirmed admin status.
 */
@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<
      AdminPermissionKey | undefined
    >(REQUIRE_PERMISSION_KEY, [context.getHandler(), context.getClass()]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser;
    // AdminAuthGuard already guarantees adminRoleId is set when this runs.
    const roleId = user.adminRoleId as string;

    const grants = await this.loadRoleGrants(request, roleId);
    if (!grants.has(required)) {
      throw new ForbiddenException(`Missing permission: ${required}`);
    }
    return true;
  }

  private loadRoleGrants(
    request: Request,
    roleId: string,
  ): Promise<Set<AdminPermissionKey>> {
    const cached = roleGrantsCache.get(request);
    if (cached) return cached;

    const promise = this.prisma.adminRolePermission
      .findMany({
        where: { roleId },
        include: { permission: true },
      })
      .then((rows) => new Set(rows.map((row) => row.permission.key)));

    roleGrantsCache.set(request, promise);
    return promise;
  }
}
