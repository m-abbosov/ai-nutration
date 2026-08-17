import { z } from 'zod';

/**
 * Validates process.env at boot. DATABASE_URL, JWT_SECRET, and
 * AI_KEY_ENCRYPTION_SECRET are hard requirements — everything OAuth/Telegram
 * related is optional so Phase 1 can still build/boot in CI or a fresh dev
 * box without third-party keys. AI is BYOK (bring-your-own-key): each user
 * supplies their own Gemini/OpenAI/Claude API key from Settings, encrypted
 * at rest with AI_KEY_ENCRYPTION_SECRET (see ai/crypto.util.ts) — there is
 * no shared server-side AI key. The *_MODEL vars only pick which model of a
 * given provider to call; they carry no credentials.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  AI_KEY_ENCRYPTION_SECRET: z
    .string()
    .min(32, 'AI_KEY_ENCRYPTION_SECRET must be at least 32 characters'),

  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_CALLBACK_URL: z.string().optional().default(''),

  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),

  GEMINI_MODEL: z.string().optional().default('gemini-flash-lite-latest'),
  OPENAI_MODEL: z.string().optional().default('gpt-4o-mini'),
  CLAUDE_MODEL: z.string().optional().default('claude-sonnet-4-5'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),
  ADMIN_FRONTEND_URL: z.string().default('http://localhost:5174'),
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
