import { useTranslation } from '@nutriai/shared/i18n'
import { useUpdateMeal } from '@/shared/api/meals'
import { cn } from '@nutriai/shared/lib/cn'
import type { MealEditSuggestionDto } from '@nutriai/shared/api/types'

export function ApplyMealEditButton({
  suggestion,
  applied,
  onApplied,
}: {
  suggestion: MealEditSuggestionDto
  applied: boolean
  onApplied: () => void
}) {
  const { t } = useTranslation()
  const updateMeal = useUpdateMeal()

  const handleClick = () => {
    if (applied || updateMeal.isPending) return
    updateMeal.mutate({ id: suggestion.mealId, ...suggestion.changes }, { onSuccess: onApplied })
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={applied || updateMeal.isPending}
        className={cn(
          'w-full rounded-[11px] px-3 py-2.5 text-[12.5px] font-semibold transition-[filter,transform] hover:brightness-[1.08] active:scale-[0.98] disabled:cursor-default disabled:hover:brightness-100',
          applied ? 'bg-accT text-acc' : 'bg-acc text-[#04120e]',
        )}
      >
        {applied ? t.app.mealEditApplied : updateMeal.isPending ? t.app.loading : t.app.mealEditApply}
      </button>
      {updateMeal.isError && !applied && (
        <p className="mt-2 text-center text-[11.5px] text-fat">{t.app.mealEditFailed}</p>
      )}
    </div>
  )
}
