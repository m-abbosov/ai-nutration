import { api } from "@nutriai/shared/api/client";
import { queryKeys } from "@nutriai/shared/api/query-client";
import type { MealDto, MealType } from "@nutriai/shared/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMeals(date?: string) {
  const qs = date ? `?date=${date}` : "";
  return useQuery({
    queryKey: queryKeys.meals(date),
    queryFn: () => api.get<MealDto[]>(`/meals${qs}`),
  });
}

export interface ManualMealPayload {
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
}

export interface AiMealPayload {
  mealType: MealType;
  name: string;
  source: "AI";
  items: { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number }[];
}

function invalidateMealDependents(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["meals"] });
  qc.invalidateQueries({ queryKey: ["nutrition"] });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard });
}

export function useAddMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManualMealPayload | AiMealPayload) => api.post<MealDto>("/meals", payload),
    onSuccess: () => invalidateMealDependents(qc),
  });
}

export function useUpdateMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<ManualMealPayload> & { id: string }) => api.patch<MealDto>(`/meals/${id}`, payload),
    onSuccess: () => invalidateMealDependents(qc),
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/meals/${id}`),
    onSuccess: () => invalidateMealDependents(qc),
  });
}
