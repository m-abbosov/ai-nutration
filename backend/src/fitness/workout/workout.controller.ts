import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { FEATURE_KEYS } from '../../common/feature-access/feature-access.constants';
import { FeatureAccessGuard } from '../../common/guards/feature-access.guard';
import { RequireFeature } from '../../common/guards/require-feature.decorator';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { ListWorkoutsQueryDto } from './dto/list-workouts-query.dto';
import { WorkoutResponseDto } from './dto/workout-response.dto';
import { WorkoutService } from './workout.service';

@UseGuards(JwtAuthGuard, FeatureAccessGuard)
@RequireFeature(FEATURE_KEYS.FITNESS)
@Controller('fitness/workouts')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListWorkoutsQueryDto,
  ): Promise<WorkoutResponseDto[]> {
    return this.workoutService.findAll(user.id, query.days);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkoutDto,
  ): Promise<WorkoutResponseDto> {
    return this.workoutService.create(user.id, dto);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<WorkoutResponseDto> {
    return this.workoutService.findOne(user.id, id);
  }
}
