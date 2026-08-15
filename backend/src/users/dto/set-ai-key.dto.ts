import { AiProvider } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class SetAiKeyDto {
  @IsEnum(AiProvider)
  provider!: AiProvider;

  @IsString()
  @MinLength(8)
  apiKey!: string;
}
