import { AdminRoleName } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class PromoteAdminDto {
  @IsString()
  userId!: string;

  @IsEnum(AdminRoleName)
  role!: AdminRoleName;
}
