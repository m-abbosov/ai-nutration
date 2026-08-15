import { AdminRoleName } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsEnum(AdminRoleName)
  role?: AdminRoleName;

  @IsOptional()
  @IsBoolean()
  adminActive?: boolean;
}
