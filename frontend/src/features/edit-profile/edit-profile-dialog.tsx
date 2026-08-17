import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from '@nutriai/shared/i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { useUpdateMe } from '@/shared/api/users'
import { editProfileSchema } from '@/features/edit-profile/schema'
import type { EditProfileFormValues } from '@/features/edit-profile/schema'
import type { UserDto } from '@nutriai/shared/api/types'

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserDto
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const updateMe = useUpdateMe()
  const { register, control, handleSubmit } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      age: user.age ?? undefined,
      heightCm: user.heightCm ?? undefined,
      weightKg: user.weightKg ?? undefined,
      goalWeightKg: user.goalWeightKg ?? undefined,
      gender: user.gender ?? undefined,
      activityLevel: user.activityLevel ?? 'MODERATE',
      goal: user.goal ?? 'MAINTAIN',
    },
  })

  const submit = handleSubmit((values) => {
    updateMe.mutate(
      {
        age: values.age,
        heightCm: values.heightCm,
        weightKg: values.weightKg,
        goalWeightKg: values.goalWeightKg === '' || values.goalWeightKg == null ? undefined : Number(values.goalWeightKg),
        gender: values.gender,
        activityLevel: values.activityLevel,
        goal: values.goal,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.prEdit}</DialogTitle>
          <DialogDescription>{t.prSub}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="age">{t.app.ageLabel}</Label>
              <Input id="age" type="number" {...register('age')} />
            </div>
            <div>
              <Label htmlFor="heightCm">{t.app.heightLabel}</Label>
              <Input id="heightCm" type="number" {...register('heightCm')} />
            </div>
            <div>
              <Label htmlFor="weightKg">{t.app.weightLabel}</Label>
              <Input id="weightKg" type="number" step="0.1" {...register('weightKg')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="goalWeightKg">{t.app.goalWeightLabel}</Label>
              <Input id="goalWeightKg" type="number" step="0.1" {...register('goalWeightKg')} />
            </div>
            <div>
              <Label htmlFor="gender">{t.app.genderOptional}</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? 'NONE'}
                    onValueChange={(v) => field.onChange(v === 'NONE' ? undefined : v)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">—</SelectItem>
                      <SelectItem value="MALE">{t.genderLabel.MALE}</SelectItem>
                      <SelectItem value="FEMALE">{t.genderLabel.FEMALE}</SelectItem>
                      <SelectItem value="OTHER">{t.genderLabel.OTHER}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="goal">{t.prGoal}</Label>
            <Controller
              name="goal"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOSE">{t.goalLabel.LOSE}</SelectItem>
                    <SelectItem value="MAINTAIN">{t.goalLabel.MAINTAIN}</SelectItem>
                    <SelectItem value="GAIN">{t.goalLabel.GAIN}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="activityLevel">{t.prAct}</Label>
            <Controller
              name="activityLevel"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="activityLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SEDENTARY">{t.activityLabel.SEDENTARY}</SelectItem>
                    <SelectItem value="LIGHT">{t.activityLabel.LIGHT}</SelectItem>
                    <SelectItem value="MODERATE">{t.activityLabel.MODERATE}</SelectItem>
                    <SelectItem value="ACTIVE">{t.activityLabel.ACTIVE}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="mt-2 flex justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t.app.cancel}
            </Button>
            <Button type="submit" disabled={updateMe.isPending}>
              {t.app.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
