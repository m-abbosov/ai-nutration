import { z } from 'zod';

/**
 * Validates process.env at boot. Only DATABASE_URL and JWT_SECRET are hard
 * requirements — everything AI/OAuth/Telegram related is optional so Phase 1
 * can still build/boot in CI or a fresh dev box without third-party keys.
 * Missing optional integrations degrade their specific endpoints at request
 * time (see auth/telegram, ai/gemini) rather than crashing the process.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().optional().default(''),

  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),

  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().optional().default('gemini-flash-lite-latest'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),
  PORT: z.string().optional().default('3001'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }
  return result.data;
}
