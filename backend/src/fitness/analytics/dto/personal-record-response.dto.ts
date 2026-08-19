import { PRType } from '@prisma/client';

export interface PersonalRecordResponseDto {
  id: string;
  exerciseId: string;
  exerciseSlug: string;
  recordType: PRType;
  value: number;
  weight: number | null;
  reps: number | null;
  achievedAt: string;
}
