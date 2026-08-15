import { Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { AdminTeamController } from './admin-team.controller';
import { AdminTeamService } from './admin-team.service';

@Module({
  imports: [AuditModule],
  controllers: [AdminTeamController],
  providers: [AdminTeamService],
})
export class AdminTeamModule {}
