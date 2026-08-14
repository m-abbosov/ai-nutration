import { useEffect, useId, useRef } from 'react'
import { env } from '@/shared/config/env'
import { useTranslation } from '@/shared/i18n'
import { useTelegramSignIn } from '@/shared/api/auth'
import type { TelegramAuthPayload } from '@/shared/api/auth'

declare global {
  interface Window {
    [key: string]: unknown
  }
}

export function TelegramSignInWidget() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const callbackName = `nutriaiTelegramAuth_${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const telegramSignIn = useTelegramSignIn()

  useEffect(() => {
    const container = containerRef.current
    if (!env.telegramBotUsername || !container) return

    window[callbackName] = (user: TelegramAuthPayload) => {
      telegramSignIn.mutate(user)
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', env.telegramBotUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '13')
    script.setAttribute('data-onauth', `${callbackName}(user)`)
    script.setAttribute('data-request-access', 'write')
    container.appendChild(script)

    return () => {
      delete window[callbackName]
      container.replaceChildren()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!env.telegramBotUsername) {
    return (
      <button
        type="button"
        disabled
        title={t.app.telegramUnavailable}
        className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-[13px] border border-line2 px-3 py-3 text-[13px] font-medium text-tx3 opacity-60"
      >
        {t.app.continueWithTelegram}
      </button>
    )
  }

  return <div ref={containerRef} className="flex w-full justify-center" />
}
