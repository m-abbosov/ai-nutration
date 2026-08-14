import { googleSignInUrl } from '@/shared/api/auth'
import { useTranslation } from '@/shared/i18n'

export function GoogleSignInButton() {
  const { t } = useTranslation()

  return (
    <a
      href={googleSignInUrl()}
      className="flex w-full items-center justify-center gap-2.5 rounded-[13px] border border-line2 px-3 py-3 text-[13px] font-medium transition-colors hover:bg-surf"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden>
        <path
          fill="#4285F4"
          d="M15.68 8.18c0-.57-.05-1.12-.15-1.64H8v3.1h4.3c-.19 1-.76 1.85-1.61 2.42v2h2.6c1.53-1.4 2.4-3.47 2.4-5.88Z"
        />
        <path
          fill="#34A853"
          d="M8 16c2.16 0 3.97-.71 5.29-1.94l-2.6-2c-.72.48-1.64.77-2.69.77-2.07 0-3.82-1.4-4.45-3.27H.87v2.06A8 8 0 0 0 8 16Z"
        />
        <path fill="#FBBC05" d="M3.55 9.56A4.8 4.8 0 0 1 3.3 8c0-.54.1-1.07.25-1.56V4.38H.87A8 8 0 0 0 0 8c0 1.29.31 2.5.87 3.62l2.68-2.06Z" />
        <path
          fill="#EA4335"
          d="M8 3.18c1.17 0 2.23.4 3.06 1.19l2.3-2.3C11.96.87 10.16 0 8 0A8 8 0 0 0 .87 4.38l2.68 2.06C4.18 4.58 5.93 3.18 8 3.18Z"
        />
      </svg>
      {t.auGoogle}
    </a>
  )
}
