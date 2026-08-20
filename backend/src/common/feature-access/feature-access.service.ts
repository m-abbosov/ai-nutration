import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { FEATURE_BOOTSTRAP_EMAILS, FeatureKey } from './feature-access.constants';

@Injectable()
export class FeatureAccessService {
  constructor(private readonly prisma: PrismaService) {}

  private isBootstrapped(feature: string, email: string | null): boolean {
    if (!email) return false;
    return (FEATURE_BOOTSTRAP_EMAILS[feature as FeatureKey] ?? []).includes(email);
  }

  async hasFeature(userId: string, feature: string): Promise<boolean> {
    const [access, user] = await Promise.all([
      this.prisma.userFeatureAccess.findUnique({
        where: { userId_feature: { userId, feature } },
        select: { id: true },
      }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    ]);
    if (access) return true;
    return this.isBootstrapped(feature, user?.email ?? null);
  }

  /** Full list of features granted to a user — DB-granted plus any
   * bootstrap-allowlisted ones — for embedding in the user's own profile
   * response so the frontend can route without a separate round trip. */
  async getUserFeatures(userId: string): Promise<string[]> {
    const [rows, user] = await Promise.all([
      this.prisma.userFeatureAccess.findMany({ where: { userId }, select: { feature: true } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    ]);
    const granted = new Set(rows.map((r) => r.feature));
    for (const [feature, emails] of Object.entries(FEATURE_BOOTSTRAP_EMAILS)) {
      if (user?.email && emails?.includes(user.email)) granted.add(feature);
    }
    return [...granted];
  }

  async grant(userId: string, feature: string, grantedById: string): Promise<void> {
    await this.prisma.userFeatureAccess.upsert({
      where: { userId_feature: { userId, feature } },
      update: { grantedById },
      create: { userId, feature, grantedById },
    });
  }

  async revoke(userId: string, feature: string): Promise<void> {
    await this.prisma.userFeatureAccess.deleteMany({ where: { userId, feature } });
  }

  async listForUser(userId: string): Promise<{ feature: string; grantedAt: string }[]> {
    const rows = await this.prisma.userFeatureAccess.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' },
    });
    return rows.map((r) => ({ feature: r.feature, grantedAt: r.grantedAt.toISOString() }));
  }
}
