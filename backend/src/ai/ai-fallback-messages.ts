import { Language } from '@prisma/client';
import { ProviderErrorReason } from './providers/provider.types';

export type ChatFailureReason =
  ProviderErrorReason | 'GENERATION_FAILED' | 'NOT_CONFIGURED';

/** User-facing assistant message shown in chat/recommendations when the AI
 * call couldn't be completed, per reason and language. Deliberately not run
 * through the AI itself — these are the messages shown when it's unreachable
 * or unusable, so they're a small static dictionary. */
const MESSAGES: Record<ChatFailureReason, Record<Language, string>> = {
  NOT_CONFIGURED: {
    UZ: "AI funksiyalaridan foydalanish uchun avval Sozlamalar bo'limida o'z API tokeningizni kiriting.",
    RU: 'Чтобы пользоваться AI-функциями, сначала добавьте свой API-токен в Настройках.',
    EN: 'Add your own AI API key in Settings to use AI features.',
  },
  INVALID_KEY: {
    UZ: "API tokeningiz yaroqsiz. Sozlamalar bo'limida tokenni tekshirib, qayta kiriting.",
    RU: 'Ваш API-токен недействителен. Проверьте и обновите его в Настройках.',
    EN: 'Your API key is invalid. Please check and update it in Settings.',
  },
  EXHAUSTED: {
    UZ: "API tokeningiz limiti tugagan. Sozlamalar bo'limida balansingizni tekshiring yoki yangi token kiriting.",
    RU: 'Лимит вашего API-токена исчерпан. Проверьте баланс или обновите токен в Настройках.',
    EN: 'Your API key has run out of quota. Check your balance or update the key in Settings.',
  },
  UNKNOWN: {
    UZ: "Kechirasiz, buni qayta ishlay olmadim. Xabaringizni boshqacha yozib ko'rasizmi?",
    RU: 'Извините, я не смог обработать это сообщение. Попробуйте переформулировать.',
    EN: "Sorry, I couldn't process that just now. Could you try rephrasing your message?",
  },
  GENERATION_FAILED: {
    UZ: "Kechirasiz, buni qayta ishlay olmadim. Xabaringizni boshqacha yozib ko'rasizmi?",
    RU: 'Извините, я не смог обработать это сообщение. Попробуйте переформулировать.',
    EN: "Sorry, I couldn't process that just now. Could you try rephrasing your message?",
  },
};

export function fallbackMessageFor(
  reason: ChatFailureReason,
  language: Language,
): string {
  return MESSAGES[reason][language];
}
