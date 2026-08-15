import { useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { useTranslation, langFlag, langName } from '@/shared/i18n'
import { useAuth } from '@/app/providers/auth-provider'
import { useUpdateMe } from '@/shared/api/users'
import { cn } from '@/shared/lib/cn'
import type { Language } from '@/shared/api/types'

const LANGS: Language[] = ['UZ', 'RU', 'EN']

/** Sidebar variant: a button that opens an upward flyout, matching the design. */
export function LanguageSwitchFlyout({ compact }: { compact?: boolean } = {}) {
  const { lang, setLang } = useTranslation()
  const { isAuthenticated } = useAuth()
  const updateMe = useUpdateMe()
  const [open, setOpen] = useState(false)

  const choose = (l: Language) => {
    setLang(l)
    setOpen(false)
    if (isAuthenticated) updateMe.mutate({ language: l })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={langName[lang]}
        className={cn(
          'flex w-full items-center gap-[11px] rounded-[11px] text-left text-tx2 transition-colors hover:bg-surf2',
          compact ? 'justify-center px-0 py-2.5' : 'px-2.5 py-2.5',
        )}
      >
        <span className="w-4 text-center text-[13px]">{langFlag[lang]}</span>
        {!compact && (
          <>
            <span className="flex-1 text-[13.5px] font-medium">{langName[lang]}</span>
            <ChevronUp className={cn('h-2.5 w-2.5 opacity-60 transition-transform', open && 'rotate-180')} />
          </>
        )}
      </button>
      {open && (
        <div
          className={cn(
            'absolute bottom-[calc(100%+6px)] z-40 animate-fu rounded-[13px] border border-line2 bg-surf2 p-1.5 shadow-card',
            compact ? 'left-0 w-[168px]' : 'inset-x-0',
          )}
        >
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => choose(l)}
              className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-surfH"
            >
              <span>{langFlag[l]}</span>
              <span className="flex-1">{langName[l]}</span>
              {lang === l && <span className="text-acc">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Settings variant: a select-style dropdown that opens downward. */
export function LanguageSwitchSelect() {
  const { lang, setLang } = useTranslation()
  const { isAuthenticated } = useAuth()
  const updateMe = useUpdateMe()
  const [open, setOpen] = useState(false)

  const choose = (l: Language) => {
    setLang(l)
    setOpen(false)
    if (isAuthenticated) updateMe.mutate({ language: l })
  }

  return (
    <div className="relative min-w-[198px]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-line2 bg-surf2 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:border-acc"
      >
        <span className="text-[14px]">{langFlag[lang]}</span>
        <span className="flex-1 truncate">{langName[lang]}</span>
        <ChevronUp className={cn('h-2.5 w-2.5 rotate-180 opacity-50 transition-transform', open && 'rotate-0')} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 animate-fu rounded-[13px] border border-line2 bg-surf2 p-1.5 shadow-card">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => choose(l)}
              className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-surfH"
            >
              <span>{langFlag[l]}</span>
              <span className="flex-1">{langName[l]}</span>
              {lang === l && <span className="text-acc">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
