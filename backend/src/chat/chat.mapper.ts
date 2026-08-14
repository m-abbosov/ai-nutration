import { ChatMessage, Conversation } from '@prisma/client';
import {
  ChatMessageMetadata,
  ChatMessageResponseDto,
} from './dto/chat-message-response.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';

export function toConversationResponseDto(
  conversation: Conversation,
): ConversationResponseDto {
  return {
    id: conversation.id,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export function toChatMessageResponseDto(
  message: ChatMessage,
): ChatMessageResponseDto {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    metadata: (message.metadata as ChatMessageMetadata) ?? null,
  };
}
