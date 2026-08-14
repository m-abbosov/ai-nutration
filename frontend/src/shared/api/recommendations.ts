import { useMutation } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import type { MealType, RecommendationDto } from '@/shared/api/types'

export function useRequestRecommendations() {
  return useMutation({
    mutationFn: (mealType?: MealType) =>
      api.post<{ recommendations: RecommendationDto[] }>('/recommendations', mealType ? { mealType } : {}),
  })
}
