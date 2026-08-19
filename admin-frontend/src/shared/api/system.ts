import { api } from "@nutriai/shared/api/client";
import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys } from "@/shared/api/query-keys";
import type { AdminSystemHealthDto, AdminSystemLogListDto } from "@/shared/api/types";

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: adminQueryKeys.systemHealth,
    queryFn: () => api.get<AdminSystemHealthDto>("/admin/system/health"),
    refetchInterval: 30_000,
  });
}

export interface AdminSystemLogsQuery {
  page: number;
  pageSize: number;
  severity?: string;
  from?: string;
  to?: string;
  search?: string;
}

function buildQuery(params: object) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v !== undefined && v !== "") usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminSystemLogs(query: AdminSystemLogsQuery) {
  return useQuery({
    queryKey: adminQueryKeys.systemLogs(query),
    queryFn: () => api.get<AdminSystemLogListDto>(`/admin/system/logs${buildQuery(query)}`),
    placeholderData: (prev) => prev,
  });
}
