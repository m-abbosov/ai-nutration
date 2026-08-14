import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-client'
import type { DashboardDto } from '@/shared/api/types'

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<DashboardDto>('/dashboard'),
  })
}
