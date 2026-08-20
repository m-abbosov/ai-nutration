import { Controller, Get, Param, ParseEnumPipe, UseGuards } from '@nestjs/common';
import { MuscleCode } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { FEATURE_KEYS } from '../../common/feature-access/feature-access.constants';
import { FeatureAccessGuard } from '../../common/guards/feature-access.guard';
import { RequireFeature } from '../../common/guards/require-feature.decorator';
import { MuscleDetailDto } from '../progress/dto/muscle-progress-response.dto';
import { MuscleTaxonomyDto } from './dto/muscle-taxonomy-response.dto';
import { MuscleService } from './muscle.service';

@UseGuards(JwtAuthGuard, FeatureAccessGuard)
@RequireFeature(FEATURE_KEYS.FITNESS)
@Controller('fitness/muscles')
export class MuscleController {
  constructor(private readonly muscleService: MuscleService) {}

  @Get()
  list(): Promise<MuscleTaxonomyDto[]> {
    return this.muscleService.list();
  }

  @Get(':muscle')
  detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('muscle', new ParseEnumPipe(MuscleCode)) muscle: MuscleCode,
  ): Promise<MuscleDetailDto> {
    return this.muscleService.getDetail(user.id, muscle);
  }
}
