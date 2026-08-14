import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { tokenStorage } from '@/shared/api/token-storage'
import { queryKeys } from '@/shared/api/query-client'
import type { UserDto } from '@/shared/api/types'
import { isOnboarded } from '@/entities/user/lib/helpers'
import { FullscreenSpinner } from '@/shared/ui/fullscreen-spinner'
import { ErrorState } from '@/shared/ui/state-blocks'

/** Reads ?token=&refresh= after the Google OAuth redirect, stores tokens, fetches
 * /auth/me, and routes to onboarding or the dashboard. */
export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token = params.get('token')
    const refresh = params.get('refresh')

    if (!token || !refresh) {
      setError('Missing tokens in callback URL.')
      return
    }

    tokenStorage.setTokens(token, refresh)

    api
      .get<UserDto>('/auth/me')
      .then((user) => {
        qc.setQueryData(queryKeys.me, user)
        navigate(isOnboarded(user) ? '/' : '/onboarding', { replace: true })
      })
      .catch(() => {
        tokenStorage.clear()
        setError('Could not complete sign-in.')
      })
  }, [params, navigate, qc])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="w-full max-w-sm">
          <ErrorState message={error} onRetry={() => navigate('/login', { replace: true })} />
        </div>
      </div>
    )
  }

  return <FullscreenSpinner />
}
