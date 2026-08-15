import { useTranslation } from '@/shared/i18n'

/** Thin convenience wrapper over the shared `useTranslation()` — the admin
 * panel reuses the same i18n system/provider, just scoped to `t.admin`. */
export function useAdminTranslation() {
  const { t, lang, setLang } = useTranslation()
  return { t: t.admin, lang, setLang }
}
