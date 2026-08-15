import { IsIn, IsOptional } from 'class-validator';
import { Range } from './range.util';

export class RangeQueryDto {
  @IsOptional()
  @IsIn(['7d', '30d', '90d', '1y'])
  range?: Range;
}
