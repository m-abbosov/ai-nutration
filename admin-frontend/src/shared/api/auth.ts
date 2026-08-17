import { useQuery } from '@tanstack/react-query'
import { api } from '@nutriai/shared/api/client'
import { env } from '@nutriai/shared/config/env'
import { adminQueryKeys } from '@/shared/api/query-keys'
import type { AdminMeDto } from '@/shared/api/types'

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
