import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { adminQueryKeys } from '@/admin/shared/api/query-keys'
import type { AdminNutritionDto, Range } from '@/admin/shared/api/types'

export function useAdminNutrition(range: Range) {
  return useQuery({
    queryKey: adminQueryKeys.nutrition(range),
    queryFn: () => api.get<AdminNutritionDto>(`/admin/nutrition?range=${range}`),
  })
}
