import { api } from "@nutriai/shared/api/client";
import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys } from "@/shared/api/query-keys";
import type { AdminFitnessDto, Range } from "@/shared/api/types";

export function useAdminFitness(range: Range) {
  return useQuery({
    queryKey: adminQueryKeys.fitness(range),
    queryFn: () => api.get<AdminFitnessDto>(`/admin/fitness?range=${range}`),
  });
}
