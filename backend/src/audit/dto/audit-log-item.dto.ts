import { AuditAction } from '@prisma/client';

/** Shared shape for `AuditLog[]` wherever the contract surfaces it — both
 * `GET /admin/audit-logs` and admin-team's per-admin `activityLog`. */
export interface AuditLogItemDto {
  id: string;
  adminName: string;
  action: AuditAction;
  targetType: string | null;
  targetId: string | null;
  metadata: unknown;
  ipAddress: string | null;
  createdAt: string;
}
