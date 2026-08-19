import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import { ListExercisesQueryDto } from './dto/list-exercises-query.dto';
import { ExerciseService } from './exercise.service';

@UseGuards(JwtAuthGuard)
@Controller('fitness/exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  list(@Query() query: ListExercisesQueryDto): Promise<ExerciseResponseDto[]> {
    return this.exerciseService.list(query.language, query.muscle);
  }
}
