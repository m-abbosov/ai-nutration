import { MuscleCode } from '@prisma/client';

/**
 * Rough weekly training volume targets (kg) per muscle group, used only as
 * the denominator for muscle-score.util.ts's volumeScore — a product
 * visualization heuristic, not a scientific training prescription. Larger
 * muscle groups worked by heavy compound lifts get higher targets; smaller
 * isolation-only groups get lower ones.
 */
export const MUSCLE_VOLUME_TARGET_KG: Record<MuscleCode, number> = {
  CHEST: 3000,
  UPPER_CHEST: 1500,
  BACK: 3500,
  LATS: 2500,
  TRAPS: 800,
  SHOULDERS: 1500,
  FRONT_DELTS: 600,
  SIDE_DELTS: 600,
  REAR_DELTS: 600,
  BICEPS: 1000,
  TRICEPS: 1200,
  FOREARMS: 500,
  ABS: 500,
  OBLIQUES: 500,
  GLUTES: 2500,
  QUADS: 4000,
  HAMSTRINGS: 2000,
  CALVES: 1500,
};
