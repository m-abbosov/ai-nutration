import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@nutriai/shared/api/client'
import { adminQueryKeys } from '@/shared/api/query-keys'
import type { AdminRoleName, AdminTeamMemberDetailDto, AdminTeamMemberDto } from '@/shared/api/types'

export function useAdminTeam() {
  return useQuery({
    queryKey: adminQueryKeys.team,
    queryFn: () => api.get<AdminTeamMemberDto[]>('/admin/admin-users'),
  })
}

export function useAdminTeamMember(id: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.teamMember(id ?? ''),
    queryFn: () => api.get<AdminTeamMemberDetailDto>(`/admin/admin-users/${id}`),
    enabled: !!id,
  })
}

export function usePromoteToAdmin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: string; role: AdminRoleName }) =>
      api.post<AdminTeamMemberDto>('/admin/admin-users', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminQueryKeys.team }),
  })
}

export function useUpdateTeamMember(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { role?: AdminRoleName; adminActive?: boolean }) =>
      api.patch<AdminTeamMemberDetailDto>(`/admin/admin-users/${id}`, payload),
    onSuccess: (data) => {
      qc.setQueryData(adminQueryKeys.teamMember(id), data)
      qc.invalidateQueries({ queryKey: adminQueryKeys.team })
    },
  })
}
