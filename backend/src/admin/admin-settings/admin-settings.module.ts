import { Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsService } from './admin-settings.service';

@Module({
  imports: [AuditModule],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService],
})
export class AdminSettingsModule {}
