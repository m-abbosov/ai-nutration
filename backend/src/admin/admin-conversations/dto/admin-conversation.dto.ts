import { ChatMessageResponseDto } from '../../../chat/dto/chat-message-response.dto';

export interface AdminConversationListItemDto {
  id: string;
  userName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface AdminConversationDetailDto {
  id: string;
  userName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageResponseDto[];
}
