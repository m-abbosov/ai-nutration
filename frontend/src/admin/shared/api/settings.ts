import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { adminQueryKeys } from '@/admin/shared/api/query-keys'
import type { AdminSettingsDto } from '@/admin/shared/api/types'

export function useAdminSettings() {
  return useQuery({
    queryKey: adminQueryKeys.settings,
    queryFn: () => api.get<AdminSettingsDto>('/admin/settings'),
  })
}

export function useToggleFeatureFlag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.patch<AdminSettingsDto['featureFlags'][number]>(`/admin/settings/feature-flags/${key}`, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQueryKeys.settings }),
  })
}
