import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useTranslation, localeTags } from '@nutriai/shared/i18n'
import { useAuth } from '@/app/providers/auth-provider'
import { ThemeToggle } from '@/features/theme-toggle/theme-toggle'
import { Avatar } from '@/shared/ui/avatar'

export function AppHeader() {
  const { t, lang } = useTranslation()
  const { user } = useAuth()

  const dateLabel = useMemo(() => {
    const now = new Date()
    // Browsers' Intl data for uz-UZ is missing full month/weekday names (falls back to
    // e.g. "M08"/"Sat"), so Uzbek is spelled out manually from the translation dictionary
    // instead of trusting Intl.DateTimeFormat here. RU/EN have complete Intl coverage.
    if (lang === 'UZ') {
      const weekdayIdx = (now.getDay() + 6) % 7
      return `${t.dayFull[weekdayIdx]}, ${now.getDate()}-${t.monthFull[now.getMonth()]}, ${now.getFullYear()}`
    }
    try {
      return new Intl.DateTimeFormat(localeTags[lang], {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
      }).format(now)
    } catch {
      return now.toDateString()
    }
  }, [lang, t])

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
        <Link to="/profile" title={t.navProf}>
          <Avatar user={user} className="h-[34px] w-[34px]" textClassName="text-[13px]" />
        </Link>
      </div>
    </header>
  )
}
