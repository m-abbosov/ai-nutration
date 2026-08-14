import { MealType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateRecommendationDto {
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}
