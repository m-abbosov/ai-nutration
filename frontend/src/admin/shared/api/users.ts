import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { adminQueryKeys } from '@/admin/shared/api/query-keys'
import type { AdminUserDetailDto, AdminUserListDto, AdminUserStatus } from '@/admin/shared/api/types'

export interface AdminUsersQuery {
  page: number
  pageSize: number
  search?: string
  goal?: string
  authProvider?: string
  status?: string
  registeredFrom?: string
  registeredTo?: string
  sortBy?: 'createdAt' | 'lastActiveAt' | 'name'
  sortDir?: 'asc' | 'desc'
}

function buildQuery(params: object) {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v !== undefined && v !== '') usp.set(k, String(v))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function useAdminUsers(query: AdminUsersQuery) {
  return useQuery({
    queryKey: adminQueryKeys.users(query),
    queryFn: () => api.get<AdminUserListDto>(`/admin/users${buildQuery(query)}`),
    placeholderData: (prev) => prev,
  })
}

export function useAdminUser(id: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.user(id ?? ''),
    queryFn: () => api.get<AdminUserDetailDto>(`/admin/users/${id}`),
    enabled: !!id,
  })
}

export function useUpdateUserStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: AdminUserStatus) => api.patch<AdminUserDetailDto>(`/admin/users/${id}/status`, { status }),
    onSuccess: (data) => {
      qc.setQueryData(adminQueryKeys.user(id), data)
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
