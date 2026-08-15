import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { PrismaService } from '../../database/prisma.service';
import { AdminTeamDetailDto, AdminTeamListItemDto } from './dto/admin-team.dto';
import { PromoteAdminDto } from './dto/promote-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

type UserWithRole = User & { adminRole: { name: string } | null };

function toListItem(user: UserWithRole): AdminTeamListItemDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.adminRole!.name as AdminTeamListItemDto['role'],
    adminActive: user.adminActive,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };
}

@Injectable()
export class AdminTeamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async list(): Promise<AdminTeamListItemDto[]> {
    const rows = await this.prisma.user.findMany({
      where: { adminRoleId: { not: null } },
      include: { adminRole: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toListItem);
  }

  async promote(
    dto: PromoteAdminDto,
    requesterId: string,
    ipAddress: string | null,
  ): Promise<AdminTeamListItemDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const role = await this.prisma.adminRole.findUnique({
      where: { name: dto.role },
    });
    if (!role) throw new NotFoundException('Role not found');

    const updated = await this.prisma.user.update({
      where: { id: dto.userId },
      data: { adminRoleId: role.id, adminActive: true },
      include: { adminRole: { select: { name: true } } },
    });

    await this.auditLogService.record({
      adminId: requesterId,
      action: 'ADMIN_ROLE_CHANGED',
      targetType: 'User',
      targetId: dto.userId,
      metadata: { from: null, to: dto.role },
      ipAddress,
    });

    return toListItem(updated);
  }

  async detail(id: string): Promise<AdminTeamDetailDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        adminRole: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
    if (!user || !user.adminRole)
      throw new NotFoundException('Admin not found');

    const activity = await this.prisma.auditLog.findMany({
      where: { adminId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { admin: { select: { name: true } } },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.adminRole.name,
      permissions: user.adminRole.permissions.map((p) => p.permission.key),
      adminActive: user.adminActive,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      activityLog: activity.map((a) => ({
        id: a.id,
        adminName: a.admin.name,
        action: a.action,
        targetType: a.targetType,
        targetId: a.targetId,
        metadata: a.metadata,
        ipAddress: a.ipAddress,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  }

  async update(
    id: string,
    dto: UpdateAdminDto,
    requesterId: string,
    ipAddress: string | null,
  ): Promise<AdminTeamListItemDto> {
    const target = await this.prisma.user.findUnique({
      where: { id },
      include: { adminRole: { select: { name: true } } },
    });
    if (!target || !target.adminRoleId)
      throw new NotFoundException('Admin not found');

    // Self-lockout guard: a SUPER_ADMIN can never disable themselves or
    // demote themselves away from SUPER_ADMIN (docs/ADMIN_API_CONTRACT.md).
    if (id === requesterId) {
      if (dto.adminActive === false) {
        throw new BadRequestException(
          'You cannot disable your own admin access',
        );
      }
      if (
        dto.role !== undefined &&
        dto.role !== 'SUPER_ADMIN' &&
        target.adminRole?.name === 'SUPER_ADMIN'
      ) {
        throw new BadRequestException(
          'You cannot change your own role away from SUPER_ADMIN',
        );
      }
    }

    const previousRole = target.adminRole?.name ?? null;
    const previousActive = target.adminActive;

    const data: Prisma.UserUpdateInput = {};
    if (dto.role !== undefined) {
      const role = await this.prisma.adminRole.findUnique({
        where: { name: dto.role },
      });
      if (!role) throw new NotFoundException('Role not found');
      data.adminRole = { connect: { id: role.id } };
    }
    if (dto.adminActive !== undefined) data.adminActive = dto.adminActive;

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { adminRole: { select: { name: true } } },
    });

    if (dto.role !== undefined && dto.role !== previousRole) {
      await this.auditLogService.record({
        adminId: requesterId,
        action: 'ADMIN_ROLE_CHANGED',
        targetType: 'User',
        targetId: id,
        metadata: { from: previousRole, to: dto.role },
        ipAddress,
      });
    }
    if (dto.adminActive !== undefined && dto.adminActive !== previousActive) {
      await this.auditLogService.record({
        adminId: requesterId,
        action: 'ADMIN_USER_STATUS_CHANGED',
        targetType: 'User',
        targetId: id,
        metadata: { from: previousActive, to: dto.adminActive },
        ipAddress,
      });
    }

    return toListItem(updated);
  }
}
