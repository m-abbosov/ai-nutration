import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@nutriai/shared/api/client'
import { queryKeys } from '@nutriai/shared/api/query-client'
import type { ChatMessageDto, ConversationDto } from '@nutriai/shared/api/types'

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
    // Echo the user's own message immediately instead of waiting for the AI
    // round-trip — otherwise the typing indicator appears before the message
    // the user just sent, which reads as if their input vanished.
    onMutate: async ({ conversationId, content }) => {
      const key = queryKeys.messages(conversationId)
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<ChatMessageDto[]>(key)
      const optimisticMessage: ChatMessageDto = {
        id: `optimistic-${Date.now()}`,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
        metadata: null,
      }
      qc.setQueryData<ChatMessageDto[]>(key, (old) => [...(old ?? []), optimisticMessage])
      return { previous, key }
    },
    onError: (_err, _variables, context) => {
      if (context) qc.setQueryData(context.key, context.previous)
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.messages(variables.conversationId) })
      qc.invalidateQueries({ queryKey: queryKeys.conversations })
    },
  })
}
