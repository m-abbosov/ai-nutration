import { Global, Module } from '@nestjs/common';
import { FeatureAccessService } from './feature-access.service';

/** Global — checked from the FeatureAccessGuard (protecting gated feature
 * endpoints like fitness/*), from AuthService/UsersService (embedding
 * `features` in the user's own profile response), and from admin-users
 * (granting/revoking access). Same pattern as FeatureFlagsModule. */
@Global()
@Module({
  providers: [FeatureAccessService],
  exports: [FeatureAccessService],
})
export class FeatureAccessModule {}
