import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { buildAiContext } from '../ai/context.util';
import { fallbackMessageFor } from '../ai/ai-fallback-messages';
import { UserAiCredentialsService } from '../ai/user-ai-credentials.service';
import { FeatureFlagsService } from '../common/feature-flags/feature-flags.service';
import { PrismaService } from '../database/prisma.service';
import { NutritionService } from '../nutrition/nutrition.service';
import {
  toChatMessageResponseDto,
  toConversationResponseDto,
} from './chat.mapper';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { SendMessageResponseDto } from './dto/chat-message-response.dto';

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
    private readonly userAiCredentials: UserAiCredentialsService,
    private readonly featureFlags: FeatureFlagsService,
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
    const chatEnabled = await this.featureFlags.isEnabled('AI_CHAT_ENABLED');
    if (!chatEnabled) {
      throw new ServiceUnavailableException('AI chat is currently disabled');
    }

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

    const credentials = this.userAiCredentials.resolve(user);

    let assistantContent: string;
    let metadata: Prisma.InputJsonValue | typeof Prisma.JsonNull =
      Prisma.JsonNull;

    if (!credentials) {
      assistantContent = fallbackMessageFor('NOT_CONFIGURED', user.language);
    } else {
      const context = buildAiContext(user, daily);
      const generation = await this.aiService.generateChatReply(
        context,
        content,
        isFirstMessage,
        credentials.provider,
        credentials.apiKey,
        userId,
      );

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
        if (user.aiKeyStatus && user.aiKeyStatus !== 'OK') {
          await this.userAiCredentials.recordStatus(userId, 'OK', null);
        }
      } else {
        assistantContent = fallbackMessageFor(generation.reason, user.language);
        if (generation.reason === 'INVALID_KEY') {
          await this.userAiCredentials.recordStatus(
            userId,
            'INVALID',
            generation.reason,
          );
        } else if (generation.reason === 'EXHAUSTED') {
          await this.userAiCredentials.recordStatus(
            userId,
            'EXHAUSTED',
            generation.reason,
          );
        }
      }
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
