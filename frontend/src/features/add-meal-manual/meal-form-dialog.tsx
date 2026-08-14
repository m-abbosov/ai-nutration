import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useTranslation } from '@/shared/i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'
import { mealTypeLabel, MEAL_TYPE_ORDER } from '@/entities/meal/lib/helpers'
import { manualMealSchema } from '@/features/add-meal-manual/schema'
import type { ManualMealFormValues } from '@/features/add-meal-manual/schema'

export function MealFormDialog({
  open,
  onOpenChange,
  title,
  description,
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  defaultValues?: Partial<ManualMealFormValues>
  onSubmit: (values: ManualMealFormValues) => void
  isSubmitting?: boolean
}) {
  const { t } = useTranslation()
  const {
    register,
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

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <div>
            <Label htmlFor="mealType">{t.app.mealTypeLabel}</Label>
            <select
              id="mealType"
              {...register('mealType')}
              className="w-full rounded-xl border border-line2 bg-surf px-3.5 py-3 text-[13.5px] outline-none focus:border-acc"
            >
              {MEAL_TYPE_ORDER.map((mt) => (
                <option key={mt} value={mt}>
                  {mealTypeLabel(mt, t)}
                </option>
              ))}
            </select>
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
