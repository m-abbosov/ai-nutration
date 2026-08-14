import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ChatService } from './chat.service';
import {
  ChatMessageResponseDto,
  SendMessageResponseDto,
} from './dto/chat-message-response.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('chat/conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponseDto[]> {
    return this.chatService.listConversations(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponseDto> {
    return this.chatService.createConversation(user.id);
  }

  @Get(':id/messages')
  getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ChatMessageResponseDto[]> {
    return this.chatService.getMessages(user.id, id);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  // Sane cap to avoid runaway Gemini spend.
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ): Promise<SendMessageResponseDto> {
    return this.chatService.sendMessage(user.id, id, dto.content);
  }
}
