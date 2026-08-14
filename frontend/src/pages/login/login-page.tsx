import { motion } from 'framer-motion'
import { useTranslation } from '@/shared/i18n'
import { LogoMark } from '@/shared/ui/nav-icons'
import { GoogleSignInButton } from '@/features/auth/google-sign-in/google-sign-in-button'
import { TelegramSignInWidget } from '@/features/auth/telegram-sign-in/telegram-sign-in-widget'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-wrap bg-bg">
      <div className="relative flex min-h-[280px] flex-1 basis-[420px] flex-col overflow-hidden bg-bg2 p-8 md:p-11">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(90% 70% at 18% 22%, var(--accT), transparent 60%)' }}
        />
        <div className="relative flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[16.5px] font-semibold tracking-[-.015em]">
            Nutri<span className="text-acc">AI</span>
          </span>
        </div>
        <div className="relative flex flex-1 items-center py-10">
          <p className="m-0 max-w-[19ch] font-serif text-[28px] leading-[1.3] tracking-[-.015em] md:text-[34px]">
            {t.auQuote}
          </p>
        </div>
        <div className="relative flex flex-wrap gap-8 border-t border-line pt-[22px]">
          <div>
            <div className="text-[23px] font-medium tracking-[-.03em]">94%</div>
            <div className="mt-[3px] max-w-[18ch] text-[11.5px] text-tx3">{t.auStat1}</div>
          </div>
          <div>
            <div className="text-[23px] font-medium tracking-[-.03em]">12 400+</div>
            <div className="mt-[3px] max-w-[18ch] text-[11.5px] text-tx3">{t.auStat2}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 basis-[440px] items-center justify-center p-7">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-[376px]"
        >
          <h2 className="m-0 text-[27px] font-medium tracking-[-.025em]">{t.auTitle}</h2>
          <p className="m-0 mt-[7px] text-[13.5px] text-tx2">{t.auSub}</p>

          <div className="mt-[30px] flex flex-col gap-[15px]">
            <GoogleSignInButton />
            <div className="my-1 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[11px] text-tx3">{t.auOr}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <TelegramSignInWidget />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
