import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class FindCalculatorUsageQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  calculatorId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
