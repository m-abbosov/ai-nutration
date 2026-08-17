import { Body, Controller, ForbiddenException, NotFoundException, Post } from '@nestjs/common';
import { AdminPermissionKey, AdminRoleName } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BootstrapSuperAdminDto } from './bootstrap-superadmin.dto';

// TEMPORARY (remove after use): one-time manual bootstrap for the very first
// SUPER_ADMIN in production, per docs/ADMIN_PANEL.md "Production deployment"
// — no UI can do this because a SUPER_ADMIN is required to create the next
// one. Mirrors prisma/seed.ts's seedAdminPanel() so the admin_roles/
// admin_permissions tables end up seeded exactly as local dev does.
const ADMIN_PERMISSIONS: Record<AdminPermissionKey, string> = {
  DASHBOARD_READ: 'View the admin dashboard overview',
  USERS_READ: 'View regular user accounts and their detail pages',
  USERS_UPDATE: 'Edit regular user account fields',
  USERS_DISABLE: "Disable/re-enable a regular user's account",
  NUTRITION_READ: 'View aggregate nutrition analytics',
  AI_READ: 'View AI usage overview/analytics',
  AI_LOGS_READ: 'View individual AI request logs',
  CONVERSATIONS_READ: "View a user's chat conversation content",
  ANALYTICS_READ: 'View the analytics dashboard',
  SYSTEM_READ: 'View system health and error logs',
  ADMIN_USERS_READ: 'View admin team members and their roles',
  ADMIN_USERS_MANAGE: "Promote users to admin and manage admins' roles/access",
  SETTINGS_MANAGE: 'Change app settings and toggle feature flags',
  AUDIT_LOGS_READ: 'View the full admin audit log',
};

const ROLE_PERMISSIONS: Record<AdminRoleName, AdminPermissionKey[]> = {
  SUPER_ADMIN: Object.keys(ADMIN_PERMISSIONS) as AdminPermissionKey[],
  ADMIN: [
    'DASHBOARD_READ',
    'USERS_READ',
    'USERS_UPDATE',
    'USERS_DISABLE',
    'NUTRITION_READ',
    'AI_READ',
    'AI_LOGS_READ',
    'CONVERSATIONS_READ',
    'ANALYTICS_READ',
    'SYSTEM_READ',
  ],
  MODERATOR: ['DASHBOARD_READ', 'USERS_READ', 'USERS_UPDATE', 'NUTRITION_READ'],
  SUPPORT: ['DASHBOARD_READ', 'USERS_READ'],
};

@Controller('internal/bootstrap')
export class BootstrapSuperAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('superadmin')
  async promote(@Body() dto: BootstrapSuperAdminDto) {
    const expected = process.env.BOOTSTRAP_SECRET;
    if (!expected || dto.secret !== expected) {
      throw new ForbiddenException();
    }

    const permissionByKey = new Map<AdminPermissionKey, string>();
    for (const [key, description] of Object.entries(ADMIN_PERMISSIONS) as [
      AdminPermissionKey,
      string,
    ][]) {
      const permission = await this.prisma.adminPermission.upsert({
        where: { key },
        update: { description },
        create: { key, description },
      });
      permissionByKey.set(key, permission.id);
    }

    let superAdminRoleId: string | undefined;
    for (const [roleName, permissionKeys] of Object.entries(ROLE_PERMISSIONS) as [
      AdminRoleName,
      AdminPermissionKey[],
    ][]) {
      const role = await this.prisma.adminRole.upsert({
        where: { name: roleName },
        update: { isSystem: true },
        create: { name: roleName, isSystem: true },
      });

      const desiredPermissionIds = permissionKeys.map((key) => permissionByKey.get(key)!);
      await this.prisma.adminRolePermission.createMany({
        data: desiredPermissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
        skipDuplicates: true,
      });

      if (roleName === 'SUPER_ADMIN') {
        superAdminRoleId = role.id;
      }
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException(`No user with email ${dto.email} has signed in yet`);
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { adminRoleId: superAdminRoleId, adminActive: true },
    });

    return { ok: true, userId: user.id, email: user.email };
  }
}
