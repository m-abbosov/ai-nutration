import { api } from "@nutriai/shared/api/client";
import { queryKeys } from "@nutriai/shared/api/query-client";
import type { MuscleBalanceDto, MuscleCode, MuscleDetailDto, MuscleProgressDto, MuscleTaxonomyDto, PersonalRecordDto } from "@nutriai/shared/api/types";
import { useQuery } from "@tanstack/react-query";

export function useMuscleProgress() {
  return useQuery({
    queryKey: queryKeys.muscleProgress,
    queryFn: () => api.get<MuscleProgressDto[]>("/fitness/progress"),
  });
}

export function useMuscleDetail(muscle: MuscleCode | undefined) {
  return useQuery({
    queryKey: queryKeys.muscleDetail(muscle ?? ""),
    queryFn: () => api.get<MuscleDetailDto>(`/fitness/muscles/${muscle}`),
    enabled: !!muscle,
  });
}

export function useMuscleTaxonomy() {
  return useQuery({
    queryKey: queryKeys.muscleTaxonomy,
    queryFn: () => api.get<MuscleTaxonomyDto[]>("/fitness/muscles"),
    staleTime: 60 * 60 * 1000, // static taxonomy, rarely changes
  });
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: queryKeys.personalRecords,
    queryFn: () => api.get<PersonalRecordDto[]>("/fitness/personal-records"),
  });
}

export function useMuscleBalance() {
  return useQuery({
    queryKey: queryKeys.muscleBalance,
    queryFn: () => api.get<MuscleBalanceDto>("/fitness/muscle-balance"),
  });
}
