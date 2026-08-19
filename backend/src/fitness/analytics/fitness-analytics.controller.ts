import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { MuscleBalanceResponseDto } from './dto/muscle-balance-response.dto';
import { PersonalRecordResponseDto } from './dto/personal-record-response.dto';
import { MuscleBalanceService } from './muscle-balance.service';
import { PersonalRecordService } from './personal-record.service';

@UseGuards(JwtAuthGuard)
@Controller('fitness')
export class FitnessAnalyticsController {
  constructor(
    private readonly personalRecordService: PersonalRecordService,
    private readonly muscleBalanceService: MuscleBalanceService,
  ) {}

  @Get('personal-records')
  listPersonalRecords(@CurrentUser() user: AuthenticatedUser): Promise<PersonalRecordResponseDto[]> {
    return this.personalRecordService.list(user.id);
  }

  @Get('muscle-balance')
  getMuscleBalance(@CurrentUser() user: AuthenticatedUser): Promise<MuscleBalanceResponseDto> {
    return this.muscleBalanceService.getBalance(user.id);
  }
}
