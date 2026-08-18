import { api } from "@nutriai/shared/api/client";
import { queryKeys } from "@nutriai/shared/api/query-client";
import type { DashboardDto } from "@nutriai/shared/api/types";
import { useQuery } from "@tanstack/react-query";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => api.get<DashboardDto>("/dashboard"),
  });
}
