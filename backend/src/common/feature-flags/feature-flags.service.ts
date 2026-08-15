import { Injectable } from '@nestjs/common';
import { FeatureFlag } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

/**
 * Defaults used only when a flag row is missing (e.g. the seed hasn't run
 * yet in a fresh dev environment) — matches the seeded defaults documented
 * in docs/ADMIN_PANEL.md so an unseeded database behaves exactly like a
 * freshly-seeded one from every call site's point of view.
 */
const DEFAULT_WHEN_MISSING: Record<string, boolean> = {
  AI_CHAT_ENABLED: true,
  RECOMMENDATIONS_ENABLED: true,
  GOOGLE_AUTH_ENABLED: true,
  TELEGRAM_AUTH_ENABLED: true,
  MAINTENANCE_MODE: false,
};

/**
 * Thin read/write wrapper over the `FeatureFlag` table, shared by every real
 * enforcement call site (chat send, recommendations generate, Google/
 * Telegram auth entry, the global maintenance check) and by
 * admin-settings' feature-flag list/toggle endpoints. Global module — no
 * explicit import needed by consumers.
 */
@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (flag) return flag.enabled;
    return DEFAULT_WHEN_MISSING[key] ?? true;
  }

  async findAll(): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async setEnabled(
    key: string,
    enabled: boolean,
    updatedById: string,
  ): Promise<FeatureFlag> {
    return this.prisma.featureFlag.update({
      where: { key },
      data: { enabled, updatedById },
    });
  }
}
