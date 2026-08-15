import { AdminPermissionKey, AdminRoleName } from '@prisma/client';
import { AuditLogItemDto } from '../../common/audit-log-item.dto';

export interface AdminTeamListItemDto {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  role: AdminRoleName;
  adminActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminTeamDetailDto {
  id: string;
  name: string;
  email: string | null;
  role: AdminRoleName;
  permissions: AdminPermissionKey[];
  adminActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  activityLog: AuditLogItemDto[];
}
