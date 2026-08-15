import { IsIn, IsISO8601, IsOptional } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsIn(['7d', '30d', '90d', 'custom'])
  range?: '7d' | '30d' | '90d' | 'custom';

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
