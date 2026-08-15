import { Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { AdminConversationsController } from './admin-conversations.controller';
import { AdminConversationsService } from './admin-conversations.service';

@Module({
  imports: [AuditModule],
  controllers: [AdminConversationsController],
  providers: [AdminConversationsService],
})
export class AdminConversationsModule {}
