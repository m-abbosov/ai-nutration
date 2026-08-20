import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  ExerciseCategory,
  Language,
  MuscleCode,
} from '@prisma/client';

const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  'COMPOUND',
  'ISOLATION',
  'CARDIO',
  'BODYWEIGHT',
];
const MUSCLE_CODES: MuscleCode[] = [
  'CHEST',
  'UPPER_CHEST',
  'BACK',
  'LATS',
  'TRAPS',
  'SHOULDERS',
  'FRONT_DELTS',
  'SIDE_DELTS',
  'REAR_DELTS',
  'BICEPS',
  'TRICEPS',
  'FOREARMS',
  'ABS',
  'OBLIQUES',
  'GLUTES',
  'QUADS',
  'HAMSTRINGS',
  'CALVES',
];
const LANGUAGES: Language[] = ['EN', 'RU', 'UZ'];

export class ExerciseAliasInputDto {
  @IsIn(LANGUAGES)
  language!: Language;

  @IsString()
  @MinLength(1)
  alias!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class ExerciseSecondaryMuscleInputDto {
  @IsIn(MUSCLE_CODES)
  muscle!: MuscleCode;

  @IsNumber()
  @Min(0)
  @Max(1)
  weight!: number;
}

export class CreateExerciseDto {
  // Optional — auto-derived from the EN primary alias when omitted (see
  // admin-exercises.service.ts slugify()).
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @IsIn(EXERCISE_CATEGORIES)
  category!: ExerciseCategory;

  @IsIn(MUSCLE_CODES)
  primaryMuscle!: MuscleCode;

  @IsOptional()
  @IsString()
  equipment?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExerciseAliasInputDto)
  aliases!: ExerciseAliasInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseSecondaryMuscleInputDto)
  secondaryMuscles?: ExerciseSecondaryMuscleInputDto[];
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @IsOptional()
  @IsIn(EXERCISE_CATEGORIES)
  category?: ExerciseCategory;

  @IsOptional()
  @IsIn(MUSCLE_CODES)
  primaryMuscle?: MuscleCode;

  @IsOptional()
  @IsString()
  equipment?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExerciseAliasInputDto)
  aliases?: ExerciseAliasInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseSecondaryMuscleInputDto)
  secondaryMuscles?: ExerciseSecondaryMuscleInputDto[];
}

export class ListAdminExercisesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(MUSCLE_CODES)
  muscle?: MuscleCode;

  @IsOptional()
  @IsIn(EXERCISE_CATEGORIES)
  category?: ExerciseCategory;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export interface AdminExerciseAliasDto {
  language: Language;
  alias: string;
  isPrimary: boolean;
}

export interface AdminExerciseMuscleDto {
  muscle: MuscleCode;
  weight: number;
}

export interface AdminExerciseListItemDto {
  id: string;
  slug: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleCode;
  equipment: string | null;
  isCustom: boolean;
}

export interface AdminExerciseDetailDto extends AdminExerciseListItemDto {
  aliases: AdminExerciseAliasDto[];
  secondaryMuscles: AdminExerciseMuscleDto[];
}
