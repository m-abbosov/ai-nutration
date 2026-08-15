import { useTranslation } from '@/shared/i18n'
import { useAddMeal, useMeals } from '@/shared/api/meals'
import { MealFormDialog } from '@/features/add-meal-manual/meal-form-dialog'

export function AddMealManualDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  const addMeal = useAddMeal()
  const { data: previousMeals } = useMeals()

  return (
    <MealFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.app.manualEntryTitle}
      description={t.app.manualEntrySub}
      isSubmitting={addMeal.isPending}
      previousMeals={previousMeals}
      onSubmit={(values) =>
        addMeal.mutate(
          {
            mealType: values.mealType,
            name: values.name,
            calories: values.calories,
            protein: values.protein,
            carbs: values.carbs,
            fat: values.fat,
            servingSize: values.servingSize || undefined,
          },
          { onSuccess: () => onOpenChange(false) },
        )
      }
    />
  )
}
