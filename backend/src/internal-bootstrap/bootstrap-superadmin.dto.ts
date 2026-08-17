import { IsEmail, IsString } from 'class-validator';

export class BootstrapSuperAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  secret!: string;
}
