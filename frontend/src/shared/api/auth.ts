import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-client'
import { tokenStorage } from '@/shared/api/token-storage'
import { env } from '@/shared/config/env'
import type { AuthTokensDto, UserDto } from '@/shared/api/types'

export function googleSignInUrl() {
  return `${env.apiUrl}/auth/google`
}

export interface TelegramAuthPayload {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api.get<UserDto>('/auth/me'),
    enabled,
    retry: false,
  })
}

export function useTelegramSignIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TelegramAuthPayload) =>
      api.post<AuthTokensDto>('/auth/telegram', payload, { skipAuth: true }),
    onSuccess: (data) => {
      tokenStorage.setTokens(data.accessToken, data.refreshToken)
      qc.setQueryData(queryKeys.me, data.user)
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<void>('/auth/logout'),
    onSettled: () => {
      tokenStorage.clear()
      qc.clear()
    },
  })
}
