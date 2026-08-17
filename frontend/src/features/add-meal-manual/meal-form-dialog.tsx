import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useTranslation } from '@nutriai/shared/i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { mealTypeLabel, MEAL_TYPE_ORDER } from '@/entities/meal/lib/helpers'
import { manualMealSchema } from '@/features/add-meal-manual/schema'
import type { ManualMealFormValues } from '@/features/add-meal-manual/schema'
import type { MealDto } from '@nutriai/shared/api/types'

export function MealFormDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  isSubmitting,
  previousMeals,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: Partial<ManualMealFormValues>
  onSubmit: (values: ManualMealFormValues) => void
  isSubmitting?: boolean
  /** When provided (non-empty), shows a picker to prefill the form from an earlier logged meal. */
  previousMeals?: MealDto[]
}) {
  const { t } = useTranslation()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualMealFormValues>({
    resolver: zodResolver(manualMealSchema),
    defaultValues: { mealType: 'BREAKFAST', name: '', calories: 0, protein: 0, carbs: 0, fat: 0, ...defaultValues },
  })

  useEffect(() => {
    if (open) reset({ mealType: 'BREAKFAST', name: '', calories: 0, protein: 0, carbs: 0, fat: 0, ...defaultValues })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const applyPreviousMeal = (mealId: string) => {
    const meal = previousMeals?.find((m) => m.id === mealId)
    if (!meal) return
    reset({
      mealType: meal.mealType,
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      servingSize: meal.servingSize ?? undefined,
    })
  }

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          {previousMeals && previousMeals.length > 0 && (
            <div>
              <Label htmlFor="previousMeal">{t.app.selectPreviousMeal}</Label>
              <Select onValueChange={applyPreviousMeal}>
                <SelectTrigger id="previousMeal">
                  <SelectValue placeholder={t.app.selectPreviousMealPh} />
                </SelectTrigger>
                <SelectContent>
                  {previousMeals.map((meal) => (
                    <SelectItem key={meal.id} value={meal.id}>
                      {meal.name} · {meal.calories} {t.kcal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="mealType">{t.app.mealTypeLabel}</Label>
            <Controller
              name="mealType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="mealType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPE_ORDER.map((mt) => (
                      <SelectItem key={mt} value={mt}>
                        {mealTypeLabel(mt, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="name">{t.app.mealNameLabel}</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="mt-1 text-[11px] text-fat">{t.app.required}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="calories">{t.app.caloriesLabel}</Label>
              <Input id="calories" type="number" step="1" {...register('calories')} />
            </div>
            <div>
              <Label htmlFor="servingSize">{t.app.servingSizeLabel}</Label>
              <Input id="servingSize" {...register('servingSize')} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="protein">{t.app.proteinLabel}</Label>
              <Input id="protein" type="number" step="0.1" {...register('protein')} />
            </div>
            <div>
              <Label htmlFor="carbs">{t.app.carbsLabel}</Label>
              <Input id="carbs" type="number" step="0.1" {...register('carbs')} />
            </div>
            <div>
              <Label htmlFor="fat">{t.app.fatLabel}</Label>
              <Input id="fat" type="number" step="0.1" {...register('fat')} />
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t.app.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t.app.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
