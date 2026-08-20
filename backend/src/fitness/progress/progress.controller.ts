import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { FEATURE_KEYS } from '../../common/feature-access/feature-access.constants';
import { FeatureAccessGuard } from '../../common/guards/feature-access.guard';
import { RequireFeature } from '../../common/guards/require-feature.decorator';
import { MuscleProgressDto } from './dto/muscle-progress-response.dto';
import { ProgressService } from './progress.service';

@UseGuards(JwtAuthGuard, FeatureAccessGuard)
@RequireFeature(FEATURE_KEYS.FITNESS)
@Controller('fitness/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getAll(@CurrentUser() user: AuthenticatedUser): Promise<MuscleProgressDto[]> {
    return this.progressService.getAllProgress(user.id);
  }
}
