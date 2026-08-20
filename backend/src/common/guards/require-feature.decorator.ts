import { SetMetadata } from '@nestjs/common';
import { FeatureKey } from '../feature-access/feature-access.constants';

export const REQUIRE_FEATURE_KEY = 'requireFeatureAccess';

/** Marks a controller/handler as requiring a granted UserFeatureAccess (or
 * bootstrap-allowlisted) feature, checked by FeatureAccessGuard. This is the
 * real server-side boundary — hiding a route on the frontend alone is never
 * sufficient access control. */
export const RequireFeature = (feature: FeatureKey) => SetMetadata(REQUIRE_FEATURE_KEY, feature);
