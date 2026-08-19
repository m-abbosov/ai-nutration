import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsString, ValidateNested } from 'class-validator';
import { ExerciseSetInputDto } from './exercise-set-input.dto';

export class WorkoutExerciseInputDto {
  // Resolved exercise id — ambiguity (e.g. an unclear chat phrase like
  // "Yelkaga max") must already be resolved client-side before this DTO is
  // built; the server only ever persists a confirmed exerciseId, never a
  // raw text guess (see chat/workout-analysis handling in Phase B).
  @IsString()
  exerciseId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExerciseSetInputDto)
  sets!: ExerciseSetInputDto[];
}
