import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

/**
 * Telegram Login Widget payload — see https://core.telegram.org/widgets/login.
 * Field set and types match exactly what the widget posts.
 */
export class TelegramAuthDto {
  @Type(() => Number)
  @IsInt()
  id!: number;

  @IsString()
  first_name!: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @Type(() => Number)
  @IsInt()
  auth_date!: number;

  @IsString()
  hash!: string;
}
