import { Injectable } from '@nestjs/common';
import { ProgressService } from '../progress/progress.service';
import { MuscleBalanceResponseDto } from './dto/muscle-balance-response.dto';
import { calculateMuscleBalance } from './lib/muscle-balance.util';

@Injectable()
export class MuscleBalanceService {
  constructor(private readonly progressService: ProgressService) {}

  async getBalance(userId: string): Promise<MuscleBalanceResponseDto> {
    const volumeByMuscle = await this.progressService.getLast4WeeksVolumeByMuscle(userId);
    return calculateMuscleBalance(volumeByMuscle);
  }
}
