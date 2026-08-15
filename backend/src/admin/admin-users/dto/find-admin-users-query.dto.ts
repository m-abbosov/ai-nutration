import { Goal, UserStatus } from '@prisma/client';
import { IsEnum, IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

export class FindAdminUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Goal)
  goal?: Goal;

  @IsOptional()
  @IsIn(['google', 'telegram'])
  authProvider?: 'google' | 'telegram';

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsISO8601()
  registeredFrom?: string;

  @IsOptional()
  @IsISO8601()
  registeredTo?: string;

  @IsOptional()
  @IsIn(['createdAt', 'lastActiveAt', 'name'])
  sortBy?: 'createdAt' | 'lastActiveAt' | 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
