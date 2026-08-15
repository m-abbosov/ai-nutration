import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { toChatMessageResponseDto } from '../../chat/chat.mapper';
import { PrismaService } from '../../database/prisma.service';
import { PaginatedDto, paginationParams } from '../common/pagination.dto';
import {
  AdminConversationDetailDto,
  AdminConversationListItemDto,
} from './dto/admin-conversation.dto';
import { FindConversationsQueryDto } from './dto/find-conversations-query.dto';

@Injectable()
export class AdminConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async list(
    query: FindConversationsQueryDto,
  ): Promise<PaginatedDto<AdminConversationListItemDto>> {
    const { page, pageSize, skip, take } = paginationParams(query);

    const where: Prisma.ConversationWhereInput = {};
    if (query.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }
    if (query.userId) where.userId = query.userId;

    const [rows, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { name: true } },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        userName: row.user.name,
        title: row.title,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        messageCount: row._count.messages,
      })),
      total,
      page,
      pageSize,
    };
  }

  async detail(
    id: string,
    adminId: string,
    ipAddress: string | null,
  ): Promise<AdminConversationDetailDto> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    // Written unconditionally, on every access — this is the one audit
    // event that must never be skipped (docs/ADMIN_API_CONTRACT.md).
    await this.auditLogService.record({
      adminId,
      action: 'CONVERSATION_VIEWED',
      targetType: 'Conversation',
      targetId: id,
      metadata: { ownerUserId: conversation.userId },
      ipAddress,
    });

    return {
      id: conversation.id,
      userName: conversation.user.name,
      title: conversation.title,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map(toChatMessageResponseDto),
    };
  }
}
