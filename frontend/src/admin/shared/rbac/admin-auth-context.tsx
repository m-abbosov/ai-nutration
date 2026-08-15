import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { tokenStorage } from '@/shared/api/token-storage'
import { ApiError } from '@/shared/api/client'
import { useAdminMe } from '@/admin/shared/api/auth'
import type { AdminMeDto, AdminPermissionKey } from '@/admin/shared/api/types'

interface AdminAuthContextValue {
  admin: AdminMeDto | undefined
  isLoading: boolean
  /** A valid admin session: token present, /admin/auth/me resolved. */
  isAdminAuthenticated: boolean
  /** Token present but the account is not an admin (or admin is disabled) — 403 from /admin/auth/me. */
  isForbidden: boolean
  error: unknown
  refetch: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

/**
 * Admin session state, independent of the Phase 1 `AuthProvider`. Reuses the
 * SAME stored JWT (`tokenStorage`) — an admin is just a User row with a role
 * — but never clears those tokens on a 403 here, since a non-admin user must
 * stay signed in to the regular app. This provider is UX-only; every admin
 * route is independently enforced server-side (see docs/ADMIN_PANEL.md).
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const hasToken = !!tokenStorage.getAccessToken()
  const { data: admin, isLoading, error, refetch } = useAdminMe(hasToken)

  const isForbidden = error instanceof ApiError && error.statusCode === 403
  const isUnauthorized = error instanceof ApiError && error.statusCode === 401

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      isLoading: hasToken && isLoading,
      isAdminAuthenticated: hasToken && !!admin && !isForbidden && !isUnauthorized,
      isForbidden,
      error,
      refetch,
    }),
    [admin, isLoading, hasToken, isForbidden, isUnauthorized, error, refetch],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}

export function usePermission(permission: AdminPermissionKey): boolean {
  const { admin } = useAdminAuth()
  return !!admin?.role.permissions.includes(permission)
}

export function useHasAnyPermission(permissions: AdminPermissionKey[]): boolean {
  const { admin } = useAdminAuth()
  if (!admin) return false
  return permissions.some((p) => admin.role.permissions.includes(p))
}

export function IfPermission({
  permission,
  children,
  fallback = null,
}: {
  permission: AdminPermissionKey
  children: ReactNode
  fallback?: ReactNode
}) {
  const allowed = usePermission(permission)
  return <>{allowed ? children : fallback}</>
}
