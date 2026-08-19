import { api } from "@nutriai/shared/api/client";
import { queryKeys } from "@nutriai/shared/api/query-client";
import type { ExerciseDto, Language, MuscleCode } from "@nutriai/shared/api/types";
import { useQuery } from "@tanstack/react-query";

export function useExercises(language: Language, muscle?: MuscleCode) {
  const qs = new URLSearchParams({ language, ...(muscle ? { muscle } : {}) }).toString();
  return useQuery({
    queryKey: queryKeys.exercises(`${language}:${muscle ?? "all"}`),
    queryFn: () => api.get<ExerciseDto[]>(`/fitness/exercises?${qs}`),
    staleTime: 60 * 60 * 1000, // catalog rarely changes — cache for an hour
  });
}
