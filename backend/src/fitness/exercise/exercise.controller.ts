import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FEATURE_KEYS } from '../../common/feature-access/feature-access.constants';
import { FeatureAccessGuard } from '../../common/guards/feature-access.guard';
import { RequireFeature } from '../../common/guards/require-feature.decorator';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import { ListExercisesQueryDto } from './dto/list-exercises-query.dto';
import { ExerciseService } from './exercise.service';

@UseGuards(JwtAuthGuard, FeatureAccessGuard)
@RequireFeature(FEATURE_KEYS.FITNESS)
@Controller('fitness/exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  list(@Query() query: ListExercisesQueryDto): Promise<ExerciseResponseDto[]> {
    return this.exerciseService.list(query.language, query.muscle);
  }
}
