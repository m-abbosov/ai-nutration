import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-client'
import type { NutritionDailyDto, NutritionWeeklyPointDto } from '@/shared/api/types'

export function useDailyNutrition(date?: string) {
  const qs = date ? `?date=${date}` : ''
  return useQuery({
    queryKey: queryKeys.nutritionDaily(date),
    queryFn: () => api.get<NutritionDailyDto>(`/nutrition/daily${qs}`),
  })
}

export function useWeeklyNutrition(days = 7) {
  return useQuery({
    queryKey: queryKeys.nutritionWeekly(days),
    queryFn: () => api.get<NutritionWeeklyPointDto[]>(`/nutrition/weekly?days=${days}`),
  })
}
