import { Global, Module } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';

/** Global so every module that needs to check a flag (chat, recommendations,
 * auth, the maintenance-mode guard, admin-settings) can inject
 * `FeatureFlagsService` without an explicit imports: [] wire-up — same
 * pattern as `DatabaseModule`. */
@Global()
@Module({
  providers: [FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
