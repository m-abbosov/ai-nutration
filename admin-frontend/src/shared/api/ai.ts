import { useQuery } from '@tanstack/react-query'
import { api } from '@nutriai/shared/api/client'
import { adminQueryKeys } from '@/shared/api/query-keys'
import type { AdminAiOverviewDto, AdminAiRequestDetailDto, AdminAiRequestListDto, Range } from '@/shared/api/types'

export interface AdminAiRequestsQuery {
  page: number
  pageSize: number
  status?: string
  endpoint?: string
  userId?: string
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

export function useAdminAiOverview(range: Range) {
  return useQuery({
    queryKey: adminQueryKeys.aiOverview(range),
    queryFn: () => api.get<AdminAiOverviewDto>(`/admin/ai/overview?range=${range}`),
  })
}

export function useAdminAiRequests(query: AdminAiRequestsQuery) {
  return useQuery({
    queryKey: adminQueryKeys.aiRequests(query),
    queryFn: () => api.get<AdminAiRequestListDto>(`/admin/ai/requests${buildQuery(query)}`),
    placeholderData: (prev) => prev,
  })
}

export function useAdminAiRequest(id: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.aiRequest(id ?? ''),
    queryFn: () => api.get<AdminAiRequestDetailDto>(`/admin/ai/requests/${id}`),
    enabled: !!id,
  })
}
