import type { MealDto } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";

import { useUpdateMeal } from "@/shared/api/meals";

import { MealFormDialog } from "@/features/add-meal-manual/meal-form-dialog";

export function EditMealDialog({ meal, open, onOpenChange }: { meal: MealDto; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const updateMeal = useUpdateMeal();

  return (
    <MealFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.edit}
      description={meal.name}
      isSubmitting={updateMeal.isPending}
      defaultValues={{
        mealType: meal.mealType,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        servingSize: meal.servingSize ?? undefined,
      }}
      onSubmit={(values) =>
        updateMeal.mutate(
          {
            id: meal.id,
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
  );
}
