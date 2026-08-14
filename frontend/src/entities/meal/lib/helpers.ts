import type { MealType } from '@/shared/api/types'
import type { Dict } from '@/shared/i18n/types'

/** Emoji + display-time defaults per meal type, matching the design's timeline icons. */
export const MEAL_TYPE_EMOJI: Record<MealType, string> = {
  BREAKFAST: '🌅',
  LUNCH: '☀️',
  SNACK: '🍎',
  DINNER: '🌙',
}

export const MEAL_TYPE_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER']

export function mealTypeLabel(type: MealType, t: Dict): string {
  switch (type) {
    case 'BREAKFAST':
      return t.bfast
    case 'LUNCH':
      return t.lunch
    case 'SNACK':
      return t.snack
    case 'DINNER':
      return t.dinner
  }
}

export function macroPercent(consumed: number, target: number): number {
  if (!target) return 0
  return Math.max(0, Math.min(100, Math.round((consumed / target) * 100)))
}
