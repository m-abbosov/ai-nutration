import { createContext, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/shared/api/auth'
import { setUnauthorizedHandler, ApiError } from '@/shared/api/client'
import { tokenStorage } from '@/shared/api/token-storage'
import type { UserDto } from '@/shared/api/types'
import { isOnboarded } from '@/entities/user/lib/helpers'

interface AuthContextValue {
  user: UserDto | undefined
  isLoading: boolean
  isAuthenticated: boolean
  isOnboarded: boolean
  error: unknown
  refetch: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const hasToken = !!tokenStorage.getAccessToken()
  const { data: user, isLoading, error, refetch } = useMe(hasToken)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      qc.clear()
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate, qc])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: hasToken && isLoading,
      isAuthenticated: hasToken && !!user && !(error instanceof ApiError && error.statusCode === 401),
      isOnboarded: isOnboarded(user),
      error,
      refetch,
    }),
    [user, isLoading, hasToken, error, refetch],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
