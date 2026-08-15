import { motion } from 'framer-motion'
import { adminGoogleSignInUrl } from '@/admin/shared/api/auth'
import { useAdminTranslation } from '@/admin/shared/i18n/use-admin-translation'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.92l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11Z" />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  )
}

export function AdminLoginPage() {
  const { t } = useAdminTranslation()

  return (
    <div className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--adm-bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[368px] rounded-[var(--adm-radius-lg)] border p-7"
        style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-lg)' }}
      >
        <div className="flex flex-col items-center text-center">
          <span
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-[var(--adm-radius-md)] text-[14px] font-bold"
            style={{ background: 'var(--adm-accent)', color: 'var(--adm-text-on-accent)' }}
          >
            N
          </span>
          <h1 className="text-[16px] font-semibold tracking-tight" style={{ color: 'var(--adm-text)' }}>
            {t.login.title}
          </h1>
          <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: 'var(--adm-text-2)' }}>
            {t.login.subtitle}
          </p>
        </div>

        <a
          href={adminGoogleSignInUrl()}
          className="mt-6 flex h-10 w-full items-center justify-center gap-2.5 rounded-[var(--adm-radius-md)] border text-[13px] font-medium transition-colors"
          style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border-strong)', color: 'var(--adm-text)' }}
        >
          <GoogleIcon />
          {t.login.google}
        </a>

        <p className="mt-6 text-center text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
          {t.login.footer}
        </p>
      </motion.div>
    </div>
  )
}
