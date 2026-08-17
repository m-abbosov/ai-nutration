export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001/api',
  telegramBotUsername: (import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined) ?? '',
} as const
