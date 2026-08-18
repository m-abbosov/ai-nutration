import { useTranslation } from '@nutriai/shared/i18n'
import { fmtNumber } from '@nutriai/shared/lib/format'
import { MEAL_TYPE_EMOJI, mealTypeLabel } from '@/entities/meal/lib/helpers'
import { ApplyMealEditButton } from '@/features/apply-meal-edit/apply-meal-edit-button'
import type { MealEditSuggestionDto } from '@nutriai/shared/api/types'

export function MealEditSuggestionCard({
  suggestion,
  applied,
  onApplied,
}: {
  suggestion: MealEditSuggestionDto
  applied: boolean
  onApplied: () => void
}) {
  const { t, lang } = useTranslation()
  const { current, changes } = suggestion

  const rows: { label: string; from: string; to: string }[] = []
  if (changes.name !== undefined) rows.push({ label: t.app.mealNameLabel, from: current.name, to: changes.name })
  if (changes.mealType !== undefined)
    rows.push({ label: t.app.mealTypeLabel, from: mealTypeLabel(current.mealType, t), to: mealTypeLabel(changes.mealType, t) })
  if (changes.calories !== undefined)
    rows.push({ label: t.app.caloriesLabel, from: `${fmtNumber(current.calories, lang)} ${t.kcal}`, to: `${fmtNumber(changes.calories, lang)} ${t.kcal}` })
  if (changes.protein !== undefined)
    rows.push({ label: t.app.proteinLabel, from: `${Math.round(current.protein)} ${t.g}`, to: `${Math.round(changes.protein)} ${t.g}` })
  if (changes.carbs !== undefined)
    rows.push({ label: t.app.carbsLabel, from: `${Math.round(current.carbs)} ${t.g}`, to: `${Math.round(changes.carbs)} ${t.g}` })
  if (changes.fat !== undefined)
    rows.push({ label: t.app.fatLabel, from: `${Math.round(current.fat)} ${t.g}`, to: `${Math.round(changes.fat)} ${t.g}` })
  if (changes.servingSize !== undefined)
    rows.push({ label: t.app.servingSizeLabel, from: current.servingSize ?? '—', to: changes.servingSize })

  return (
    <div className="mt-3.5 max-w-[400px] overflow-hidden rounded-[18px] border border-line bg-surf shadow-card">
      <div className="flex items-center gap-2.5 border-b border-line px-4 pb-3.5 pt-[15px]">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-accT text-[17px]">
          {MEAL_TYPE_EMOJI[current.mealType]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold tracking-[-.01em]">{current.name}</div>
          <div className="mt-0.5 font-mono text-[10.5px] tracking-[.1em] text-tx3">{t.app.mealEditSuggestionTitle}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5 text-[12px]">
            <span className="w-[78px] flex-none truncate text-tx2">{r.label}</span>
            <span className="min-w-0 flex-1 truncate text-tx3 line-through">{r.from}</span>
            <span className="flex-none text-tx3">→</span>
            <span className="min-w-0 flex-1 truncate text-right font-medium text-tx">{r.to}</span>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <ApplyMealEditButton suggestion={suggestion} applied={applied} onApplied={onApplied} />
      </div>
    </div>
  )
}
