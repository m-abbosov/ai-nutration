import { useMemo } from 'react'
import { Bell } from 'lucide-react'
import { useTranslation, localeTags } from '@/shared/i18n'
import { useAuth } from '@/app/providers/auth-provider'
import { ThemeToggle } from '@/features/theme-toggle/theme-toggle'
import { userInitial } from '@/entities/user/lib/helpers'

export function AppHeader() {
  const { t, lang } = useTranslation()
  const { user } = useAuth()

  const dateLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(localeTags[lang], {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
      }).format(new Date())
    } catch {
      return new Date().toDateString()
    }
  }, [lang])

  return (
    <header className="z-30 flex flex-none flex-wrap items-end gap-5 border-b border-line bg-glass px-[22px] py-[18px] pt-[26px] backdrop-blur-[14px] md:px-[34px]">
      <div className="min-w-[240px] flex-1">
        <h1 className="m-0 text-[22px] font-medium leading-[1.15] tracking-[-.02em] md:text-[26px]">
          {t.greet}
          {user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="m-0 mt-[5px] text-[13.5px] text-tx2">{t.greetSub}</p>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2 whitespace-nowrap rounded-[10px] border border-line px-3 py-[7px] font-mono text-[11px] text-tx2 sm:flex">
          <span className="h-[5px] w-[5px] animate-pulse-soft rounded-full bg-acc" />
          {dateLabel}
        </div>
        <ThemeToggle />
        <button className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-line text-tx2 transition-colors hover:bg-surf2 hover:text-tx">
          <Bell className="h-[15px] w-[15px]" />
        </button>
        <div className="grid h-[34px] w-[34px] place-items-center rounded-full border border-line2 bg-accT text-[13px] font-semibold text-acc">
          {userInitial(user)}
        </div>
      </div>
    </header>
  )
}
