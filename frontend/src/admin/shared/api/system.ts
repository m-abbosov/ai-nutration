import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { adminQueryKeys } from '@/admin/shared/api/query-keys'
import type { AdminSystemHealthDto, AdminSystemLogListDto } from '@/admin/shared/api/types'

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: adminQueryKeys.systemHealth,
    queryFn: () => api.get<AdminSystemHealthDto>('/admin/system/health'),
    refetchInterval: 30_000,
  })
}

export interface AdminSystemErrorsQuery {
  page: number
  pageSize: number
  severity?: string
  from?: string
  to?: string
}

function buildQuery(params: object) {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v !== undefined && v !== '') usp.set(k, String(v))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function useAdminSystemErrors(query: AdminSystemErrorsQuery) {
  return useQuery({
    queryKey: adminQueryKeys.systemErrors(query),
    queryFn: () => api.get<AdminSystemLogListDto>(`/admin/system/errors${buildQuery(query)}`),
    placeholderData: (prev) => prev,
  })
}
