import { AuditAction } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../admin/common/pagination.dto';

export class FindAuditLogsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  adminId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
