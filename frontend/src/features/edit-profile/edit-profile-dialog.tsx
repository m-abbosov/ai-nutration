import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from '@/shared/i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Button } from '@/shared/ui/button'
import { useUpdateMe } from '@/shared/api/users'
import { editProfileSchema } from '@/features/edit-profile/schema'
import type { EditProfileFormValues } from '@/features/edit-profile/schema'
import type { UserDto } from '@/shared/api/types'

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
  const { register, handleSubmit } = useForm<EditProfileFormValues>({
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
              <select
                id="gender"
                {...register('gender')}
                className="w-full rounded-xl border border-line2 bg-surf px-3.5 py-3 text-[13.5px] outline-none focus:border-acc"
              >
                <option value="">—</option>
                <option value="MALE">{t.genderLabel.MALE}</option>
                <option value="FEMALE">{t.genderLabel.FEMALE}</option>
                <option value="OTHER">{t.genderLabel.OTHER}</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="goal">{t.prGoal}</Label>
            <select
              id="goal"
              {...register('goal')}
              className="w-full rounded-xl border border-line2 bg-surf px-3.5 py-3 text-[13.5px] outline-none focus:border-acc"
            >
              <option value="LOSE">{t.goalLabel.LOSE}</option>
              <option value="MAINTAIN">{t.goalLabel.MAINTAIN}</option>
              <option value="GAIN">{t.goalLabel.GAIN}</option>
            </select>
          </div>
          <div>
            <Label htmlFor="activityLevel">{t.prAct}</Label>
            <select
              id="activityLevel"
              {...register('activityLevel')}
              className="w-full rounded-xl border border-line2 bg-surf px-3.5 py-3 text-[13.5px] outline-none focus:border-acc"
            >
              <option value="SEDENTARY">{t.activityLabel.SEDENTARY}</option>
              <option value="LIGHT">{t.activityLabel.LIGHT}</option>
              <option value="MODERATE">{t.activityLabel.MODERATE}</option>
              <option value="ACTIVE">{t.activityLabel.ACTIVE}</option>
            </select>
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
