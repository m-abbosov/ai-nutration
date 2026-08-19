import { Language, MuscleCode } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListExercisesQueryDto {
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsEnum(MuscleCode)
  muscle?: MuscleCode;
}
