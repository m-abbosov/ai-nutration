import { PRType } from '@prisma/client';

/** A PR just set by a workout that was saved moments ago — used to drive the
 * Phase D "New PR!" celebration. Not persisted under this shape; mirrors
 * personal_records rows for the exercises touched by that one workout. */
export interface DetectedPrDto {
  exerciseId: string;
  recordType: PRType;
  value: number;
  weight: number | null;
  reps: number | null;
}
