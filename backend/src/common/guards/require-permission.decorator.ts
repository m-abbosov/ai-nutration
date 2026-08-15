import { SetMetadata } from '@nestjs/common';
import { AdminPermissionKey } from '@prisma/client';

export const REQUIRE_PERMISSION_KEY = 'requireAdminPermission';

/** Marks a controller method as requiring a specific admin permission,
 * checked by `AdminPermissionGuard` against the current admin's role via
 * `AdminRolePermission`. See docs/ADMIN_API_CONTRACT.md for the exact
 * permission required per route. */
export const RequirePermission = (key: AdminPermissionKey) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, key);
