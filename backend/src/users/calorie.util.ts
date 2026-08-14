import { ActivityLevel, Gender, Goal } from '@prisma/client';

/**
 * Calorie/macro target calculation — Mifflin-St Jeor BMR × activity
 * multiplier, adjusted by goal, with a fixed 25/45/30 macro split.
 * Exactly mirrors the formula documented in docs/API_CONTRACT.md and
 * DESIGN_MAPPING.md. Pure function, no side effects — unit-testable in
 * isolation.
 */

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
};

const GOAL_ADJUSTMENT_KCAL: Record<Goal, number> = {
  LOSE: -500,
  MAINTAIN: 0,
  GAIN: 300,
};

export interface CalorieInput {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface CalorieTargets {
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
}

export function calculateBmr(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const male = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  if (gender === 'MALE') return male;
  const female = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  if (gender === 'FEMALE') return female;
  // OTHER: average of the two (MALE formula - 78), per API_CONTRACT.md.
  return male - 78;
}

export function calculateCalorieTargets(input: CalorieInput): CalorieTargets {
  const bmr = calculateBmr(
    input.gender,
    input.weightKg,
    input.heightCm,
    input.age,
  );
  const tdee = bmr * ACTIVITY_MULTIPLIER[input.activityLevel];
  const target = Math.round(tdee + GOAL_ADJUSTMENT_KCAL[input.goal]);

  return {
    dailyCalorieTarget: target,
    proteinTargetG: Math.round((target * 0.25) / 4),
    carbsTargetG: Math.round((target * 0.45) / 4),
    fatTargetG: Math.round((target * 0.3) / 9),
  };
}
