import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const queryKeys = {
  me: ['me'] as const,
  geminiHealth: ['health', 'gemini'] as const,
  dashboard: ['dashboard'] as const,
  meals: (date?: string) => ['meals', date ?? 'today'] as const,
  nutritionDaily: (date?: string) => ['nutrition', 'daily', date ?? 'today'] as const,
  nutritionWeekly: (days: number) => ['nutrition', 'weekly', days] as const,
  conversations: ['chat', 'conversations'] as const,
  messages: (conversationId: string) => ['chat', 'conversations', conversationId, 'messages'] as const,
}
