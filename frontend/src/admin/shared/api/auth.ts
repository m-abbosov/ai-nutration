import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { env } from '@/shared/config/env'
import { adminQueryKeys } from '@/admin/shared/api/query-keys'
import type { AdminMeDto } from '@/admin/shared/api/types'

export function adminGoogleSignInUrl() {
  return `${env.apiUrl}/auth/google?state=admin`
}

export function useAdminMe(enabled: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.me,
    queryFn: () => api.get<AdminMeDto>('/admin/auth/me'),
    enabled,
    retry: false,
  })
}
