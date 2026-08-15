import { createContext, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const qc = useQueryClient()
  // Admin Panel (Phase 2) touch point: `/admin/*` runs its own auth check
  // (AdminAuthProvider, same JWT). Skip the Phase 1 `/auth/me` call there so
  // it can never race the admin guard or bounce an expired admin session to
  // the wrong login page — a no-op for every Phase 1 route, unchanged.
  const isAdminRoute = location.pathname.startsWith('/admin')
  const hasToken = !isAdminRoute && !!tokenStorage.getAccessToken()
  const { data: user, isLoading, error, refetch } = useMe(hasToken)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      qc.clear()
      navigate(location.pathname.startsWith('/admin') ? '/admin/login' : '/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate, qc, location.pathname])

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
