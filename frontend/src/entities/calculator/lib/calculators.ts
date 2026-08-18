export type CalculatorCategory = 'health' | 'nutrition' | 'fitness'
export type CalculatorIcon = 'ring' | 'bar' | 'drop' | 'heart'

export interface CalculatorMeta {
  id: string
  cat: CalculatorCategory
  pop: boolean
  icon: CalculatorIcon
  /** SVG stroke-dasharray for `icon: 'ring'` cards — falls back to '31 13'. */
  dash: string
}

/** Ported verbatim from docs/design-reference/landing.html (`const CALCS`). */
export const CALCS: CalculatorMeta[] = [
  { id: 'bmi', cat: 'health', pop: true, icon: 'ring', dash: '31 13' },
  { id: 'bodyfat', cat: 'health', pop: false, icon: 'ring', dash: '22 20' },
  { id: 'ideal', cat: 'health', pop: false, icon: 'bar', dash: '' },
  { id: 'bmr', cat: 'health', pop: false, icon: 'ring', dash: '26 16' },
  { id: 'tdee', cat: 'health', pop: true, icon: 'bar', dash: '' },
  { id: 'calories', cat: 'nutrition', pop: true, icon: 'ring', dash: '34 10' },
  { id: 'macros', cat: 'nutrition', pop: true, icon: 'ring', dash: '18 24' },
  { id: 'protein', cat: 'nutrition', pop: false, icon: 'bar', dash: '' },
  { id: 'water', cat: 'nutrition', pop: false, icon: 'drop', dash: '' },
  { id: 'pace', cat: 'fitness', pop: false, icon: 'bar', dash: '' },
  { id: 'burned', cat: 'fitness', pop: true, icon: 'heart', dash: '' },
  { id: 'orm', cat: 'fitness', pop: false, icon: 'bar', dash: '' },
  { id: 'hr', cat: 'fitness', pop: false, icon: 'heart', dash: '' },
  { id: 'lbm', cat: 'fitness', pop: false, icon: 'ring', dash: '24 18' },
]

export type CalculatorId = (typeof CALCS)[number]['id']

export const CALC_CATEGORY_COLOR: Record<CalculatorCategory, string> = {
  health: 'var(--acc)',
  nutrition: 'var(--carb)',
  fitness: 'var(--pro)',
}

export const CALC_CATEGORY_TINT: Record<CalculatorCategory, string> = {
  health: 'var(--accT)',
  nutrition: 'var(--carbT)',
  fitness: 'var(--proT)',
}

export function findCalculator(id: string | undefined): CalculatorMeta | undefined {
  return CALCS.find((c) => c.id === id)
}
