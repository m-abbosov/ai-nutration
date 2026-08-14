import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Language } from '@/shared/api/types'
import type { Dict } from '@/shared/i18n/types'
import { uz } from '@/shared/i18n/locales/uz'
import { ru } from '@/shared/i18n/locales/ru'
import { en } from '@/shared/i18n/locales/en'

const dictionaries: Record<Language, Dict> = { UZ: uz, RU: ru, EN: en }

export const localeTags: Record<Language, string> = { UZ: 'uz-UZ', RU: 'ru-RU', EN: 'en-US' }
export const langFlag: Record<Language, string> = { UZ: '🇺🇿', RU: '🇷🇺', EN: '🇬🇧' }
export const langName: Record<Language, string> = { UZ: "O'zbekcha", RU: 'Русский', EN: 'English' }

const STORAGE_KEY = 'nutriai.language'

function readStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'UZ' || stored === 'RU' || stored === 'EN') return stored
  return 'UZ'
}

interface I18nContextValue {
  lang: Language
  t: Dict
  setLang: (lang: Language) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readStoredLanguage)

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = useMemo<I18nContextValue>(() => ({ lang, t: dictionaries[lang], setLang }), [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}
