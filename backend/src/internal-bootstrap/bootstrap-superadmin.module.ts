import { Module } from '@nestjs/common';
import { BootstrapSuperAdminController } from './bootstrap-superadmin.controller';

// TEMPORARY (remove after use) — see bootstrap-superadmin.controller.ts.
@Module({
  controllers: [BootstrapSuperAdminController],
})
export class BootstrapSuperAdminModule {}
