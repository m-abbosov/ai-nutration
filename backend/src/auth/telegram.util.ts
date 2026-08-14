import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

const MAX_AUTH_AGE_SECONDS = 86400; // 24h, per Telegram widget guidance

/**
 * Verifies a Telegram Login Widget payload per the documented protocol
 * (https://core.telegram.org/widgets/login#checking-authorization):
 *   data-check-string = alphabetically sorted `key=value` fields (all
 *     fields except `hash`) joined by `\n`
 *   secret_key = SHA256(bot_token)
 *   expected_hash = HMAC-SHA256(data-check-string, secret_key), hex-encoded
 * The payload is valid iff expected_hash === hash (constant-time compare).
 */
export function verifyTelegramHash(
  payload: TelegramAuthDto,
  botToken: string,
): boolean {
  const { hash, ...rest } = payload;

  const dataCheckString = Object.keys(rest)
    .sort()
    .filter((key) => rest[key as keyof typeof rest] !== undefined)
    .map((key) => `${key}=${String(rest[key as keyof typeof rest])}`)
    .join('\n');

  const secretKey = createHash('sha256').update(botToken).digest();
  const expectedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedHash, 'hex');
  const actualBuf = Buffer.from(hash, 'hex');
  if (expectedBuf.length !== actualBuf.length) return false;

  return timingSafeEqual(expectedBuf, actualBuf);
}

export function isAuthDateFresh(
  authDate: number,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  return nowSeconds - authDate <= MAX_AUTH_AGE_SECONDS;
}
