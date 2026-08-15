import { AdminPermissionKey, AdminRoleName } from '@prisma/client';

export interface AdminMeDto {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  role: { name: AdminRoleName; permissions: AdminPermissionKey[] };
}
