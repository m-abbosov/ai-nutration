import { WeightUnit } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ExerciseSetInputDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  setNumber!: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(500)
  weight?: number | null;

  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(200)
  reps?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(7200)
  durationSec?: number | null;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
