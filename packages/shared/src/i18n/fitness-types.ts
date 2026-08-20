/**
 * Fitness Tracker translation namespace — lives under `Dict.fitness` in the
 * same uz/ru/en locale files as the rest of the app, not a parallel i18n
 * system. Phase B only needs the chat workout-draft/disambiguation strings
 * below; the full dashboard's copy is added in Phase D.
 */
export type MuscleCodeKey =
  | "CHEST"
  | "UPPER_CHEST"
  | "BACK"
  | "LATS"
  | "TRAPS"
  | "SHOULDERS"
  | "FRONT_DELTS"
  | "SIDE_DELTS"
  | "REAR_DELTS"
  | "BICEPS"
  | "TRICEPS"
  | "FOREARMS"
  | "ABS"
  | "OBLIQUES"
  | "GLUTES"
  | "QUADS"
  | "HAMSTRINGS"
  | "CALVES";

export interface FitnessDict {
  workoutAnalysisTitle: string;
  saveWorkout: string;
  workoutSaved: string;
  workoutSaveFailed: string;
  didYouMean: (name: string) => string;
  chooseAnother: string;
  selectExercise: string;
  setsCount: (n: number) => string;
  weightUnitKg: string;
  weightUnitLb: string;

  // Muscle body map (Phase C) — display names + hover/click copy.
  muscles: Record<MuscleCodeKey, string>;
  muscleAriaLabel: (name: string, score: number) => string;
  bodyFront: string;
  bodyBack: string;
  tooltipSets: (n: number) => string;
  tooltipSessions: (n: number) => string;
  tooltipVolume: string;
  tooltipLastTrained: string;
  tooltipNeverTrained: string;

  // Fitness dashboard (Phase D)
  pageTitle: string;
  pageSub: string;
  logWorkoutCta: string;
  todayTitle: string;
  todayEmpty: string;
  weeklyTitle: string;
  weeklySub: (n: number) => string;
  weeklyWorkouts: string;
  weeklyVolume: string;
  weeklySets: string;
  muscleMapTitle: string;
  muscleMapSub: string;
  strengthTitle: string;
  strengthEmpty: string;
  strengthSelectExercise: string;
  strengthEst1rm: string;
  recentTitle: string;
  recentEmpty: string;
  recentExercises: (n: number) => string;
  prTitle: string;
  prEmpty: string;
  prNewBadge: string;
  prTypeLabel: Record<"MAX_WEIGHT" | "MAX_REPS" | "MAX_VOLUME" | "EST_1RM", string>;
  balanceTitle: string;
  balancePush: string;
  balancePull: string;
  balanceLegs: string;
  balanceCore: string;
  balanceInsightImbalanced: (higher: string, lower: string) => string;
  balanceInsightBalanced: string;
  balanceEmpty: string;
  coachTitle: string;
  coachInsightWorkoutDone: (kcal: number, protein: number) => string;
  coachInsightNoWorkoutToday: string;
  coachInsightConsistent: (days: number) => string;
  viewProgress: string;
  detailVolumeChange: string;
  detailStrengthChange: string;
  detailSessions: string;
  close: string;

  comingSoonTitle: string;
  comingSoonBody: string;
}
