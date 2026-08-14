import type { MouseEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { useDeleteMeal } from '@/shared/api/meals'

export function DeleteMealButton({ mealId }: { mealId: string }) {
  const { t } = useTranslation()
  const deleteMeal = useDeleteMeal()

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(t.app.confirmDeleteMeal)) {
      deleteMeal.mutate(mealId)
    }
  }

  return (
    <button
      title={t.del}
      onClick={handleClick}
      disabled={deleteMeal.isPending}
      className="grid h-[29px] w-[29px] place-items-center rounded-[9px] text-tx3 transition-colors hover:bg-fatT hover:text-fat"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
