import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** A single food item within an AI-analyzed meal breakdown. */
export class MealItemInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(60)
  quantity!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5000)
  calories!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  protein!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  carbs!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  fat!: number;
}
