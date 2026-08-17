import { useQuery } from '@tanstack/react-query'
import { api } from '@nutriai/shared/api/client'
import { adminQueryKeys } from '@/shared/api/query-keys'
import type { AdminDashboardDto, Range } from '@/shared/api/types'

export function useAdminDashboard(range: Range) {
  return useQuery({
    queryKey: adminQueryKeys.dashboard(range),
    queryFn: () => api.get<AdminDashboardDto>(`/admin/dashboard?range=${range}`),
  })
}
