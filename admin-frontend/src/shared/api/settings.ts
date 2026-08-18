import { api } from "@nutriai/shared/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminQueryKeys } from "@/shared/api/query-keys";
import type { AdminSettingsDto } from "@/shared/api/types";

export function useAdminSettings() {
  return useQuery({
    queryKey: adminQueryKeys.settings,
    queryFn: () => api.get<AdminSettingsDto>("/admin/settings"),
  });
}

export function useToggleFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.patch<AdminSettingsDto["featureFlags"][number]>(`/admin/settings/feature-flags/${key}`, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQueryKeys.settings }),
  });
}
