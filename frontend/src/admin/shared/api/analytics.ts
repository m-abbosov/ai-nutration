import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { adminQueryKeys } from '@/admin/shared/api/query-keys'
import type { AdminAnalyticsDto, AnalyticsRange } from '@/admin/shared/api/types'

export interface AdminAnalyticsQuery {
  range: AnalyticsRange
  from?: string
  to?: string
}

export function useAdminAnalytics(query: AdminAnalyticsQuery) {
  const usp = new URLSearchParams({ range: query.range })
  if (query.range === 'custom') {
    if (query.from) usp.set('from', query.from)
    if (query.to) usp.set('to', query.to)
  }
  return useQuery({
    queryKey: adminQueryKeys.analytics(query),
    queryFn: () => api.get<AdminAnalyticsDto>(`/admin/analytics?${usp.toString()}`),
  })
}
