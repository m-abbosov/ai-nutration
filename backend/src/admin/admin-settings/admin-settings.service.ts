import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeatureFlag } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { FeatureFlagsService } from '../../common/feature-flags/feature-flags.service';
import { EnvConfig } from '../../config/env.validation';
import { AdminSettingsDto } from './dto/admin-settings.dto';

// Read-only display constants — not yet a persisted `AppSettings` singleton
// (docs/ADMIN_PANEL.md, "What's intentionally not built in Phase 2").
const GENERAL_SETTINGS = {
  appName: 'NutriAI',
  defaultLanguage: 'UZ' as const,
  defaultTimezone: 'Asia/Tashkent',
};

@Injectable()
export class AdminSettingsService {
  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
    private readonly featureFlags: FeatureFlagsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getSettings(): Promise<AdminSettingsDto> {
    const flags = await this.featureFlags.findAll();

    return {
      general: GENERAL_SETTINGS,
      ai: {
        enabledModels: [
          {
            provider: 'GEMINI',
            model: this.configService.get('GEMINI_MODEL', { infer: true }),
          },
          {
            provider: 'OPENAI',
            model: this.configService.get('OPENAI_MODEL', { infer: true }),
          },
          {
            provider: 'CLAUDE',
            model: this.configService.get('CLAUDE_MODEL', { infer: true }),
          },
          {
            provider: 'GROQ',
            model: this.configService.get('GROQ_MODEL', { infer: true }),
          },
        ],
      },
      featureFlags: flags.map((flag) => this.toFlagDto(flag)),
    };
  }

  private toFlagDto(
    flag: FeatureFlag,
  ): AdminSettingsDto['featureFlags'][number] {
    return {
      key: flag.key,
      enabled: flag.enabled,
      description: flag.description,
      updatedAt: flag.updatedAt.toISOString(),
    };
  }

  async setFeatureFlag(
    key: string,
    enabled: boolean,
    adminId: string,
    ipAddress: string | null,
  ): Promise<AdminSettingsDto['featureFlags'][number]> {
    const existing = await this.featureFlags.findAll();
    const current = existing.find((f) => f.key === key);
    if (!current) throw new NotFoundException(`Unknown feature flag "${key}"`);

    const updated = await this.featureFlags.setEnabled(key, enabled, adminId);

    await this.auditLogService.record({
      adminId,
      action: 'FEATURE_FLAG_CHANGED',
      targetType: 'FeatureFlag',
      targetId: key,
      metadata: { from: current.enabled, to: enabled },
      ipAddress,
    });

    return this.toFlagDto(updated);
  }
}
