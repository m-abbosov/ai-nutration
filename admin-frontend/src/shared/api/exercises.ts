import { api } from "@nutriai/shared/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminQueryKeys } from "@/shared/api/query-keys";
import type {
  AdminExerciseDetailDto,
  AdminExerciseListDto,
  CreateExerciseInput,
  ExerciseCategory,
  MuscleCode,
  UpdateExerciseInput,
} from "@/shared/api/types";

export interface AdminExercisesQuery {
  page: number;
  pageSize: number;
  search?: string;
  muscle?: MuscleCode;
  category?: ExerciseCategory;
}

function buildQuery(params: object) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v !== undefined && v !== "") usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminExercises(query: AdminExercisesQuery) {
  return useQuery({
    queryKey: adminQueryKeys.exercises(query),
    queryFn: () => api.get<AdminExerciseListDto>(`/admin/exercises${buildQuery(query)}`),
    placeholderData: (prev) => prev,
  });
}

export function useAdminExercise(id: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.exercise(id ?? ""),
    queryFn: () => api.get<AdminExerciseDetailDto>(`/admin/exercises/${id}`),
    enabled: !!id,
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateExerciseInput) => api.post<AdminExerciseDetailDto>("/admin/exercises", dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "exercises"] }),
  });
}

export function useUpdateExercise(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateExerciseInput) => api.patch<AdminExerciseDetailDto>(`/admin/exercises/${id}`, dto),
    onSuccess: (data) => {
      qc.setQueryData(adminQueryKeys.exercise(id), data);
      qc.invalidateQueries({ queryKey: ["admin", "exercises"] });
    },
  });
}

export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/admin/exercises/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "exercises"] }),
  });
}
