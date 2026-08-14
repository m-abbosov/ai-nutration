import { MealSource, MealType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { MealItemInputDto } from './meal-item-input.dto';

/**
 * Either a manual entry (mealType, name, calories, protein, carbs, fat,
 * servingSize?) or an AI-analyzed payload (mealType, name, items[],
 * source: 'AI'), per docs/API_CONTRACT.md. When source is 'AI', the
 * aggregate calories/protein/carbs/fat are ALWAYS recomputed server-side
 * from `items` — client/AI-supplied totals are never trusted directly.
 */
export class CreateMealDto {
  @IsEnum(MealType)
  mealType!: MealType;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  emoji?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  servingSize?: string;

  @IsOptional()
  @IsEnum(MealSource)
  source?: MealSource;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date?: string;

  @ValidateIf((dto: CreateMealDto) => dto.source !== 'AI')
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10000)
  calories?: number;

  @ValidateIf((dto: CreateMealDto) => dto.source !== 'AI')
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  protein?: number;

  @ValidateIf((dto: CreateMealDto) => dto.source !== 'AI')
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  carbs?: number;

  @ValidateIf((dto: CreateMealDto) => dto.source !== 'AI')
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  fat?: number;

  @ValidateIf((dto: CreateMealDto) => dto.source === 'AI')
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MealItemInputDto)
  items?: MealItemInputDto[];
}
