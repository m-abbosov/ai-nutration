import { IsIn } from 'class-validator';
import { FEATURE_KEYS } from '../../../common/feature-access/feature-access.constants';

export interface AdminUserFeatureDto {
  feature: string;
  grantedAt: string;
}

export class GrantUserFeatureDto {
  @IsIn(Object.values(FEATURE_KEYS))
  feature!: string;
}
