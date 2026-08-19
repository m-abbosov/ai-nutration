import { MuscleCode, MuscleRegion } from '@prisma/client';

export interface MuscleProgressDto {
  muscle: MuscleCode;
  region: MuscleRegion;
  progressScore: number;
  weeklySets: number;
  weeklyVolume: number;
  sessionsCount: number;
  lastTrainedAt: string | null;
}

export interface MuscleDetailDto extends MuscleProgressDto {
  thisWeekVolume: number;
  lastWeekVolume: number;
  volumeChangePct: number | null;
  strengthChangePct: number | null;
}
