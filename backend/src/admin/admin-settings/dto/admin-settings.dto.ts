import { AiProvider, Language } from '@prisma/client';

export interface AdminSettingsDto {
  general: {
    appName: string;
    defaultLanguage: Language;
    defaultTimezone: string;
  };
  ai: { enabledModels: { provider: AiProvider; model: string }[] };
  featureFlags: {
    key: string;
    enabled: boolean;
    description: string | null;
    updatedAt: string;
  }[];
}
