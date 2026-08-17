import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ShieldAlert } from 'lucide-react'
import { api } from '@nutriai/shared/api/client'
import { tokenStorage } from '@nutriai/shared/api/token-storage'
import { adminQueryKeys } from '@/shared/api/query-keys'
import type { AdminMeDto } from '@/shared/api/types'
import { AdminFullscreenSpinner } from '@/shared/ui/admin-fullscreen-spinner'
import { AdminButton } from '@/shared/ui/button'
import { useAdminTranslation } from '@/shared/i18n/use-admin-translation'

/** Reads `?token=&refresh=` (success) or `?error=not_admin` (rejection) after
 * the `state=admin` Google OAuth round trip. See docs/ADMIN_API_CONTRACT.md. */
export function AdminAuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { t } = useAdminTranslation()
  const [error, setError] = useState<'not_admin' | 'generic' | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const deniedReason = params.get('error')
    if (deniedReason === 'not_admin') {
      setError('not_admin')
      return
    }

    const token = params.get('token')
    const refresh = params.get('refresh')
    if (!token || !refresh) {
      setError('generic')
      return
    }

    tokenStorage.setTokens(token, refresh)

    api
      .get<AdminMeDto>('/admin/auth/me')
      .then((admin) => {
        qc.setQueryData(adminQueryKeys.me, admin)
        navigate('/', { replace: true })
      })
      .catch(() => {
        // Do NOT clear tokens here — the account may still be a perfectly
        // valid regular Phase 1 user, just not an admin.
        setError('generic')
      })
  }, [params, navigate, qc])

  if (error === 'not_admin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--adm-bg)' }}>
        <div
          className="flex w-full max-w-[380px] flex-col items-center gap-3 rounded-[var(--adm-radius-lg)] border p-7 text-center"
          style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-lg)' }}
        >
          <ShieldAlert className="h-6 w-6" style={{ color: 'var(--adm-critical)' }} />
          <h1 className="text-[15px] font-semibold" style={{ color: 'var(--adm-text)' }}>
            {t.callback.deniedTitle}
          </h1>
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--adm-text-2)' }}>
            {t.callback.deniedBody}
          </p>
          <AdminButton asChild variant="secondary" size="sm" className="mt-2">
            <Link to="/login">{t.callback.backToLogin}</Link>
          </AdminButton>
        </div>
      </div>
    )
  }

  if (error === 'generic') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--adm-bg)' }}>
        <div
          className="flex w-full max-w-[380px] flex-col items-center gap-3 rounded-[var(--adm-radius-lg)] border p-7 text-center"
          style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-lg)' }}
        >
          <ShieldAlert className="h-6 w-6" style={{ color: 'var(--adm-critical)' }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--adm-text-2)' }}>
            {t.callback.genericError}
          </p>
          <AdminButton asChild variant="secondary" size="sm" className="mt-2">
            <Link to="/login">{t.callback.backToLogin}</Link>
          </AdminButton>
        </div>
      </div>
    )
  }

  return <AdminFullscreenSpinner />
}
