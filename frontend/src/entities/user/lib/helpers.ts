import type { ActivityLevel, Gender, Goal, UserDto } from '@nutriai/shared/api/types'

/** Activity multipliers, ported verbatim from docs/API_CONTRACT.md / DESIGN_MAPPING.md. */
export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
}

/** Weekly rate shown on onboarding/profile, matching the design's −0.4 / 0.0 / +0.3 kg figures. */
export const GOAL_WEEKLY_RATE_KG: Record<Goal, number> = {
  LOSE: -0.4,
  MAINTAIN: 0,
  GAIN: 0.3,
}

export function bmi(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm) return null
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

export function isOnboarded(user: UserDto | undefined | null): boolean {
  return !!user?.onboardingCompletedAt
}

export function userInitial(user: UserDto | undefined | null): string {
  const name = user?.name?.trim()
  return name ? name[0].toUpperCase() : '?'
}

/** Default macro split (25/45/30) used by onboarding preview + profile fallback. */
export function defaultMacroSplit(targetKcal: number) {
  return {
    proteinG: Math.round((targetKcal * 0.25) / 4),
    carbsG: Math.round((targetKcal * 0.45) / 4),
    fatG: Math.round((targetKcal * 0.3) / 9),
  }
}

/**
 * Client-side preview of the calorie/macro formula from docs/API_CONTRACT.md
 * (Mifflin-St Jeor BMR × activity multiplier, adjusted by goal). The backend
 * recomputes and persists the authoritative values — this is only used to
 * render the onboarding result screen before/while the request is in flight.
 */
export function previewTargets(input: {
  age: number
  heightCm: number
  weightKg: number
  gender?: Gender
  activityLevel: ActivityLevel
  goal: Goal
}) {
  const { age, heightCm, weightKg, gender, activityLevel, goal } = input
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmrValue = gender === 'FEMALE' ? base - 161 : gender === 'OTHER' ? base + 5 - 78 : base + 5
  const tdee = bmrValue * ACTIVITY_MULTIPLIER[activityLevel]
  const target = Math.round(goal === 'LOSE' ? tdee - 500 : goal === 'GAIN' ? tdee + 300 : tdee)
  return { dailyCalorieTarget: target, ...defaultMacroSplit(target) }
}
