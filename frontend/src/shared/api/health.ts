import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-client'

export function useGeminiHealth() {
  return useQuery({
    queryKey: queryKeys.geminiHealth,
    queryFn: () => api.get<{ connected: boolean }>('/health/gemini'),
    staleTime: 60_000,
  })
}
