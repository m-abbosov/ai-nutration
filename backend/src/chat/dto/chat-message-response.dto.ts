import { MealAnalysis, Recommendation } from '../../ai/schemas';

export type ChatMessageMetadata =
  | { kind: 'nutrition_card'; data: MealAnalysis }
  | { kind: 'recommendations'; data: Recommendation[] }
  | null;

export interface ChatMessageResponseDto {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
  metadata: ChatMessageMetadata;
}

export interface SendMessageResponseDto {
  userMessage: ChatMessageResponseDto;
  assistantMessage: ChatMessageResponseDto;
}
