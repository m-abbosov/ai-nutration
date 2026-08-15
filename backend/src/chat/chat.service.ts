import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Language, Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { buildAiContext } from '../ai/context.util';
import { PrismaService } from '../database/prisma.service';
import { NutritionService } from '../nutrition/nutrition.service';
import {
  toChatMessageResponseDto,
  toConversationResponseDto,
} from './chat.mapper';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { SendMessageResponseDto } from './dto/chat-message-response.dto';

// Deliberately not run through Gemini — this is the one user-facing string
// the backend must produce even when the model is completely unreachable,
// so it's a small static per-language dictionary rather than an AI call.
const FALLBACK_APOLOGY: Record<Language, string> = {
  EN: "Sorry, I couldn't process that just now. Could you try rephrasing your message?",
  RU: 'Извините, я не смог обработать это сообщение. Попробуйте переформулировать.',
  UZ: "Kechirasiz, buni qayta ishlay olmadim. Xabaringizni boshqacha yozib ko'rasizmi?",
};

function truncateTitle(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, ' ');
  return trimmed.length > 48 ? `${trimmed.slice(0, 45)}...` : trimmed;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nutritionService: NutritionService,
    private readonly aiService: AiService,
  ) {}

  async listConversations(userId: string): Promise<ConversationResponseDto[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations.map(toConversationResponseDto);
  }

  async createConversation(userId: string): Promise<ConversationResponseDto> {
    const conversation = await this.prisma.conversation.create({
      data: { userId },
    });
    return toConversationResponseDto(conversation);
  }

  private async findOwnedConversationOrThrow(
    userId: string,
    conversationId: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.userId !== userId) {
      throw new ForbiddenException(
        'You do not have access to this conversation',
      );
    }
    return conversation;
  }

  async getMessages(userId: string, conversationId: string) {
    await this.findOwnedConversationOrThrow(userId, conversationId);
    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map(toChatMessageResponseDto);
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
  ): Promise<SendMessageResponseDto> {
    const conversation = await this.findOwnedConversationOrThrow(
      userId,
      conversationId,
    );

    const isFirstMessage = conversation.title === 'New chat';

    const userMessage = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content,
        metadata: Prisma.JsonNull,
      },
    });

    const [user, daily] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.nutritionService.getDaily(userId),
    ]);

    const context = buildAiContext(user, daily);
    const generation = await this.aiService.generateChatReply(
      context,
      content,
      isFirstMessage,
    );

    let assistantContent: string;
    let metadata: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      Prisma.JsonNull;

    if (generation.ok) {
      assistantContent = generation.data.reply;
      if (generation.data.mealAnalysis) {
        metadata = {
          kind: 'nutrition_card',
          data: generation.data.mealAnalysis,
        };
      } else if (generation.data.recommendations) {
        metadata = {
          kind: 'recommendations',
          data: generation.data.recommendations,
        };
      }
    } else {
      assistantContent = FALLBACK_APOLOGY[user.language];
    }

    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: assistantContent,
        metadata,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        title: isFirstMessage ? truncateTitle(content) : undefined,
      },
    });

    return {
      userMessage: toChatMessageResponseDto(userMessage),
      assistantMessage: toChatMessageResponseDto(assistantMessage),
    };
  }
}
