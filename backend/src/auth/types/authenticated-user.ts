import { UserStatus } from '@prisma/client';

/**
 * User identity attached to `request.user` by JwtStrategy. Beyond `id`
 * (all Phase 1 code needs), it carries `status`/`adminRoleId`/`adminActive`
 * so `AdminAuthGuard` can make its allow/deny decision straight from the
 * already-loaded JWT user with no extra query (see docs/ADMIN_PANEL.md,
 * "Enforcement").
 */
export interface AuthenticatedUser {
  id: string;
  status: UserStatus;
  adminRoleId: string | null;
  adminActive: boolean;
}
