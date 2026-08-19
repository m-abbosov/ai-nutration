import { MuscleCode, MuscleRegion } from '@prisma/client';

export interface MuscleTaxonomyDto {
  muscle: MuscleCode;
  region: MuscleRegion;
  sortOrder: number;
}
