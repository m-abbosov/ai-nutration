import { api } from "@nutriai/shared/api/client";
import { queryKeys } from "@nutriai/shared/api/query-client";
import type { CreateWorkoutInput, WorkoutDto } from "@nutriai/shared/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useWorkouts(days?: number) {
  const qs = days ? `?days=${days}` : "";
  return useQuery({
    queryKey: queryKeys.workouts(days),
    queryFn: () => api.get<WorkoutDto[]>(`/fitness/workouts${qs}`),
  });
}

export function useWorkout(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workout(id ?? ""),
    queryFn: () => api.get<WorkoutDto>(`/fitness/workouts/${id}`),
    enabled: !!id,
  });
}

function invalidateWorkoutDependents(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["workouts"] });
  qc.invalidateQueries({ queryKey: queryKeys.dashboard });
  qc.invalidateQueries({ queryKey: queryKeys.muscleProgress });
  qc.invalidateQueries({ queryKey: queryKeys.personalRecords });
  qc.invalidateQueries({ queryKey: queryKeys.muscleBalance });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWorkoutInput) => api.post<WorkoutDto>("/fitness/workouts", payload),
    onSuccess: () => invalidateWorkoutDependents(qc),
  });
}
