import { api } from "@nutriai/shared/api/client";
import { queryKeys } from "@nutriai/shared/api/query-client";
import type { DashboardDto } from "@nutriai/shared/api/types";
import { useQuery } from "@tanstack/react-query";

export function useDashboard(date?: string) {
  const qs = date ? `?date=${date}` : "";
  return useQuery({
    queryKey: date ? [...queryKeys.dashboard, date] : queryKeys.dashboard,
    queryFn: () => api.get<DashboardDto>(`/dashboard${qs}`),
  });
}
