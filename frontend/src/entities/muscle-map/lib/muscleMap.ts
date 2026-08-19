import type { MuscleCode } from "@nutriai/shared/api/types";

/** Which muscles FrontBody.tsx/BackBody.tsx actually render a `data-muscle`
 * path for — the single source of truth both SVGs and MuscleBodyMap.tsx
 * iterate over. Derived from a real anatomical illustration, not every one
 * of the 18 taxonomy muscles has a dedicated hotspot in it: UPPER_CHEST
 * isn't visually separated from CHEST, and SHOULDERS isn't separated from
 * FRONT_DELTS/SIDE_DELTS/REAR_DELTS — those two still have scores everywhere
 * else (progress list, muscle balance), just no distinct SVG region here. */
export const FRONT_VIEW_MUSCLES: MuscleCode[] = [
  "CHEST",
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
