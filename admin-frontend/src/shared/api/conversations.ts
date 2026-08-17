import { useQuery } from '@tanstack/react-query'
import { api } from '@nutriai/shared/api/client'
import { adminQueryKeys } from '@/shared/api/query-keys'
import type { AdminConversationDetailDto, AdminConversationListDto } from '@/shared/api/types'

export interface AdminConversationsQuery {
  page: number
  pageSize: number
  search?: string
  userId?: string
}

function buildQuery(params: object) {
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v !== undefined && v !== '') usp.set(k, String(v))
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export function useAdminConversations(query: AdminConversationsQuery) {
  return useQuery({
    queryKey: adminQueryKeys.conversations(query),
    queryFn: () => api.get<AdminConversationListDto>(`/admin/conversations${buildQuery(query)}`),
    placeholderData: (prev) => prev,
  })
}

export function useAdminConversation(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: adminQueryKeys.conversation(id ?? ''),
    queryFn: () => api.get<AdminConversationDetailDto>(`/admin/conversations/${id}`),
    enabled: !!id && enabled,
  })
}
