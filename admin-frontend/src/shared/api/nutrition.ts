import { api } from "@nutriai/shared/api/client";
import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys } from "@/shared/api/query-keys";
import type { AdminNutritionDto, Range } from "@/shared/api/types";

export function useAdminNutrition(range: Range) {
  return useQuery({
    queryKey: adminQueryKeys.nutrition(range),
    queryFn: () => api.get<AdminNutritionDto>(`/admin/nutrition?range=${range}`),
  });
}
