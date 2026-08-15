import { AiEndpoint, AiRequestStatus } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class FindAiRequestsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(AiRequestStatus)
  status?: AiRequestStatus;

  @IsOptional()
  @IsEnum(AiEndpoint)
  endpoint?: AiEndpoint;

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
