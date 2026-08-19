import type { MuscleCode } from "@nutriai/shared/api/types";

/** Which muscles FrontBody.tsx/BackBody.tsx actually render a `data-muscle`
 * path for. A muscle in both arrays (e.g. SHOULDERS) has an independent
 * shape in each view — this is the single source of truth both SVGs and
 * MuscleBodyMap.tsx iterate over, so a muscle can never go stale in one
 * view without failing loudly (missing color) in the other. */
export const FRONT_VIEW_MUSCLES: MuscleCode[] = [
  "CHEST",
  "UPPER_CHEST",
  "SHOULDERS",
  "FRONT_DELTS",
  "SIDE_DELTS",
  "BICEPS",
  "FOREARMS",
  "ABS",
  "OBLIQUES",
  "QUADS",
  "CALVES",
];

export const BACK_VIEW_MUSCLES: MuscleCode[] = [
  "SHOULDERS",
  "SIDE_DELTS",
  "REAR_DELTS",
  "TRICEPS",
  "FOREARMS",
  "BACK",
  "LATS",
  "TRAPS",
  "GLUTES",
  "HAMSTRINGS",
  "CALVES",
];
