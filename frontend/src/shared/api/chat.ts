import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/query-client'
import type { ChatMessageDto, ConversationDto } from '@/shared/api/types'

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => api.get<ConversationDto[]>('/chat/conversations'),
  })
}

export function useCreateConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<ConversationDto>('/chat/conversations', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.conversations }),
  })
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId ?? ''),
    queryFn: () => api.get<ChatMessageDto[]>(`/chat/conversations/${conversationId}/messages`),
    enabled: !!conversationId,
  })
}

export interface SendMessageResult {
  userMessage: ChatMessageDto
  assistantMessage: ChatMessageDto
}

/**
 * Takes the target conversation id per-call (rather than bound at hook-call
 * time) so a single mutation instance can send the first message right after
 * creating a brand new conversation, without violating the rules of hooks.
 */
export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      api.post<SendMessageResult>(`/chat/conversations/${conversationId}/messages`, { content }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.messages(variables.conversationId) })
      qc.invalidateQueries({ queryKey: queryKeys.conversations })
    },
  })
}
