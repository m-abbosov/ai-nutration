import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AdminMeDto } from './dto/admin-me.dto';

@Injectable()
export class AdminAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<AdminMeDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminRole: {
          include: { permissions: { include: { permission: true } } },
        },
      },
    });
    if (!user || !user.adminRole) {
      throw new NotFoundException('Admin not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: {
        name: user.adminRole.name,
        permissions: user.adminRole.permissions.map((p) => p.permission.key),
      },
    };
  }
}
