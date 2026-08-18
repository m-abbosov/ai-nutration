import { api } from "@nutriai/shared/api/client";
import type { MealType, RecommendationDto } from "@nutriai/shared/api/types";
import { useMutation } from "@tanstack/react-query";

export function useRequestRecommendations() {
  return useMutation({
    mutationFn: (mealType?: MealType) => api.post<{ recommendations: RecommendationDto[] }>("/recommendations", mealType ? { mealType } : {}),
  });
}
