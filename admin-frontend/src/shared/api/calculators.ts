import { api } from "@nutriai/shared/api/client";
import { useQuery } from "@tanstack/react-query";

import { adminQueryKeys } from "@/shared/api/query-keys";
import type { AdminCalculatorOverviewDto, AdminCalculatorUsageListDto, Range } from "@/shared/api/types";

export interface AdminCalculatorUsageQuery {
  page: number;
  pageSize: number;
  calculatorId?: string;
  userId?: string;
  from?: string;
  to?: string;
}

function buildQuery(params: object) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v !== undefined && v !== "") usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminCalculatorOverview(range: Range) {
  return useQuery({
    queryKey: adminQueryKeys.calculatorsOverview(range),
    queryFn: () => api.get<AdminCalculatorOverviewDto>(`/admin/calculators/overview?range=${range}`),
  });
}

export function useAdminCalculatorUsage(query: AdminCalculatorUsageQuery) {
  return useQuery({
    queryKey: adminQueryKeys.calculatorsUsage(query),
    queryFn: () => api.get<AdminCalculatorUsageListDto>(`/admin/calculators/usage${buildQuery(query)}`),
    placeholderData: (prev) => prev,
  });
}
