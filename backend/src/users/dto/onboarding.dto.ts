import { ActivityLevel, Gender, Goal } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class OnboardingDto {
  @Type(() => Number)
  @IsInt()
  @Min(13)
  @Max(120)
  age!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(50)
  @Max(272)
  heightCm!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(20)
  @Max(500)
  weightKg!: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsEnum(ActivityLevel)
  activityLevel!: ActivityLevel;

  @IsEnum(Goal)
  goal!: Goal;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(20)
  @Max(500)
  goalWeightKg?: number;
}
