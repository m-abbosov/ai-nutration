import { SystemLogSeverity } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class FindSystemErrorsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(SystemLogSeverity)
  severity?: SystemLogSeverity;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
