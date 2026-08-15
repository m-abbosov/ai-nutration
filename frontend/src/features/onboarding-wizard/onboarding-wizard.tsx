import { useState } from 'react'
import type { ReactNode } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'
import { fmtNumber } from '@/shared/lib/format'
import { LogoMark } from '@/shared/ui/nav-icons'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { cn } from '@/shared/lib/cn'
import { useSubmitOnboarding, useSetAiKey } from '@/shared/api/users'
import { previewTargets } from '@/entities/user/lib/helpers'
import type { ActivityLevel, AiProvider, Goal } from '@/shared/api/types'
import { onboardingSchema, STEP_FIELDS } from '@/features/onboarding-wizard/schema'
import type { OnboardingFormValues } from '@/features/onboarding-wizard/schema'

const AI_PROVIDERS: AiProvider[] = ['GEMINI', 'OPENAI', 'CLAUDE']

const GOALS: { value: Goal; deltaLabel: string }[] = [
  { value: 'LOSE', deltaLabel: '−0,4 kg' },
  { value: 'MAINTAIN', deltaLabel: '0,0 kg' },
  { value: 'GAIN', deltaLabel: '+0,3 kg' },
]

const ACTIVITIES: { value: ActivityLevel; mult: string }[] = [
  { value: 'SEDENTARY', mult: '1,2' },
  { value: 'LIGHT', mult: '1,375' },
  { value: 'MODERATE', mult: '1,55' },
  { value: 'ACTIVE', mult: '1,725' },
]

export function OnboardingWizard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const submitOnboarding = useSubmitOnboarding()
  const setAiKey = useSetAiKey()
  const [aiProvider, setAiProvider] = useState<AiProvider>('GEMINI')
  const [aiApiKey, setAiApiKey] = useState('')

  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: { goal: 'LOSE', activityLevel: 'MODERATE', age: 25, heightCm: 170, weightKg: 70 },
  })

  const values = watch()
  const preview =
    values.age && values.heightCm && values.weightKg
      ? previewTargets({
          age: Number(values.age),
          heightCm: Number(values.heightCm),
          weightKg: Number(values.weightKg),
          gender: values.gender,
          activityLevel: values.activityLevel,
          goal: values.goal,
        })
      : null

  const goNext = async () => {
    const fields = STEP_FIELDS[step]
    const valid = fields.length === 0 || (await trigger(fields))
    if (!valid) return
    if (step < 4) setStep((s) => s + 1)
  }
  const goBack = () => setStep((s) => Math.max(0, s - 1))

  const skipAiStep = () => setStep((s) => s + 1)
  const saveAiKeyAndContinue = () => {
    if (!aiApiKey.trim()) return
    setAiKey.mutate(
      { provider: aiProvider, apiKey: aiApiKey.trim() },
      { onSuccess: () => setStep((s) => s + 1) },
    )
  }

  const onSubmit = handleSubmit((data) => {
    submitOnboarding.mutate(
      {
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        gender: data.gender,
        activityLevel: data.activityLevel,
        goal: data.goal,
        goalWeightKg: data.goalWeightKg === '' || data.goalWeightKg == null ? undefined : Number(data.goalWeightKg),
      },
      { onSuccess: () => navigate('/', { replace: true }) },
    )
  })

  const dots = [0, 1, 2, 3, 4]

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-bg px-5 pb-10 pt-[34px]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: 'radial-gradient(70% 100% at 50% 0, var(--accT), transparent 66%)' }}
      />
      <div className="relative w-full max-w-[544px]">
        <div className="flex items-center justify-center gap-2.5">
          <LogoMark width={24} height={24} />
          <span className="text-[15.5px] font-semibold tracking-[-.015em]">
            Nutri<span className="text-acc">AI</span>
          </span>
        </div>

        <div className="mt-[26px] flex items-center justify-center gap-3">
          <span className="font-mono text-[9.5px] tracking-[.16em] text-tx3">
            {t.onStep} {step + 1} / 4
          </span>
          <span className="flex items-center gap-[5px]">
            {dots.map((i) => (
              <span
                key={i}
                className={cn(
                  'h-[5px] rounded-full transition-all duration-300',
                  i <= step ? 'bg-acc' : 'bg-line2',
                  i === step ? 'w-[22px]' : 'w-[7px]',
                )}
              />
            ))}
          </span>
        </div>

        <div className="mt-[30px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="goal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="m-0 text-center text-[25px] font-medium tracking-[-.025em] md:text-[27px]">{t.onQ1}</h2>
                <p className="m-0 mt-2 text-center text-[13.5px] text-tx2">{t.onQ1s}</p>
                <div className="mt-6 flex flex-col gap-2.5">
                  {GOALS.map(({ value, deltaLabel }) => {
                    const active = values.goal === value
                    const labelKey = value === 'LOSE' ? 'onG1' : value === 'MAINTAIN' ? 'onG2' : 'onG3'
                    const subKey = value === 'LOSE' ? 'onG1s' : value === 'MAINTAIN' ? 'onG2s' : 'onG3s'
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue('goal', value, { shouldValidate: true })}
                        className={cn(
                          'flex items-center gap-3.5 rounded-2xl border px-[17px] py-4 text-left transition-all hover:-translate-y-px',
                          active ? 'border-acc bg-accT' : 'border-line bg-surf',
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-[19px] w-[19px] flex-none place-items-center rounded-full border-[1.5px]',
                            active ? 'border-acc' : 'border-line2',
                          )}
                        >
                          <span className={cn('h-[9px] w-[9px] rounded-full', active ? 'bg-acc' : 'bg-transparent')} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14.5px] font-medium">{t[labelKey]}</span>
                          <span className="mt-0.5 block text-[12px] text-tx3">{t[subKey]}</span>
                        </span>
                        <span className="whitespace-nowrap font-mono text-[11.5px] text-tx2">{deltaLabel}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="metrics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="m-0 text-center text-[25px] font-medium tracking-[-.025em] md:text-[27px]">{t.onQ2}</h2>
                <p className="m-0 mt-2 text-center text-[13.5px] text-tx2">{t.onQ2s}</p>
                <div className="mt-6 flex flex-col gap-1 overflow-hidden rounded-[18px] border border-line bg-line">
                  <MetricRow label={t.app.ageLabel} unit={t.prYears} error={errors.age?.message}>
                    <input
                      type="number"
                      className="w-16 bg-transparent text-right text-[18px] font-medium outline-none [appearance:textfield]"
                      {...register('age')}
                    />
                  </MetricRow>
                  <MetricRow label={t.app.heightLabel} unit="cm" error={errors.heightCm?.message}>
                    <input
                      type="number"
                      className="w-16 bg-transparent text-right text-[18px] font-medium outline-none [appearance:textfield]"
                      {...register('heightCm')}
                    />
                  </MetricRow>
                  <MetricRow label={t.app.weightLabel} unit={t.pgKg} error={errors.weightKg?.message}>
                    <input
                      type="number"
                      step="0.1"
                      className="w-16 bg-transparent text-right text-[18px] font-medium outline-none [appearance:textfield]"
                      {...register('weightKg')}
                    />
                  </MetricRow>
                  <MetricRow label={t.app.genderOptional}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? 'NONE'}
                          onValueChange={(v) => field.onChange(v === 'NONE' ? undefined : v)}
                        >
                          <SelectTrigger className="w-auto border-none bg-transparent p-0 text-right text-[13px] font-medium hover:border-none">
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
                  </MetricRow>
                  <MetricRow label={t.app.goalWeightLabel}>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="—"
                      className="w-16 bg-transparent text-right text-[13px] font-medium outline-none placeholder:text-tx3 [appearance:textfield]"
                      {...register('goalWeightKg')}
                    />
                  </MetricRow>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="m-0 text-center text-[25px] font-medium tracking-[-.025em] md:text-[27px]">{t.onQ3}</h2>
                <p className="m-0 mt-2 text-center text-[13.5px] text-tx2">{t.onQ3s}</p>
                <div className="mt-6 flex flex-col gap-2.5">
                  {ACTIVITIES.map(({ value, mult }, i) => {
                    const active = values.activityLevel === value
                    const labelKey = (['onA1', 'onA2', 'onA3', 'onA4'] as const)[i]
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue('activityLevel', value, { shouldValidate: true })}
                        className={cn(
                          'flex items-center gap-3.5 rounded-2xl border px-[17px] py-3.5 text-left transition-colors',
                          active ? 'border-acc bg-accT' : 'border-line bg-surf',
                        )}
                      >
                        <span
                          className={cn(
                            'grid h-[17px] w-[17px] flex-none place-items-center rounded-full border-[1.5px]',
                            active ? 'border-acc' : 'border-line2',
                          )}
                        >
                          <span className={cn('h-2 w-2 rounded-full', active ? 'bg-acc' : 'bg-transparent')} />
                        </span>
                        <span className="min-w-0 flex-1 text-[14px] font-medium">{t[labelKey]}</span>
                        <span className="font-mono text-[11px] text-tx3">×{mult}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="ai-key" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="m-0 text-center text-[25px] font-medium tracking-[-.025em] md:text-[27px]">
                  {t.app.aiOnboardingTitle}
                </h2>
                <p className="m-0 mt-2 text-center text-[13.5px] text-tx2">{t.app.aiOnboardingSub}</p>
                <div className="mt-6 flex flex-col gap-3 rounded-[18px] border border-line bg-surf p-[18px]">
                  <div>
                    <Label htmlFor="onboarding-ai-provider">{t.app.aiApiKeyLabel}</Label>
                    <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as AiProvider)}>
                      <SelectTrigger id="onboarding-ai-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_PROVIDERS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {t.aiProviderLabel[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="password"
                    autoComplete="off"
                    placeholder={t.app.aiApiKeyPh}
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                  />
                  {setAiKey.isError && <p className="text-[12px] text-fat">{t.app.error}</p>}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="relative mx-auto mb-1.5 h-[184px] w-[184px]">
                  <div
                    className="absolute inset-[12%] animate-halo rounded-full blur-[20px]"
                    style={{ background: 'radial-gradient(circle, var(--accG), transparent 66%)' }}
                  />
                  <svg viewBox="0 0 184 184" className="relative h-full w-full">
                    <circle cx="92" cy="92" r="76" fill="none" stroke="var(--line2)" strokeWidth="9" />
                    <circle
                      cx="92"
                      cy="92"
                      r="76"
                      fill="none"
                      stroke="var(--acc)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      pathLength={100}
                      strokeDasharray="100 100"
                      transform="rotate(-90 92 92)"
                      style={{ filter: 'drop-shadow(0 0 8px var(--accG))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="font-mono text-[38px] font-medium leading-none tracking-[-.035em]">
                      {preview ? fmtNumber(preview.dailyCalorieTarget, 'EN') : '—'}
                    </div>
                    <div className="mt-[5px] text-[11.5px] text-tx2">{t.onKcal}</div>
                  </div>
                </div>
                <h2 className="m-0 mt-3.5 font-serif text-[28px] font-normal tracking-[-.01em] md:text-[31px]">
                  {t.onDone}
                </h2>
                <p className="m-0 mt-2 text-[13.5px] text-tx2">{t.onDoneS}</p>
                {preview && (
                  <>
                    <div className="mt-6 flex h-[11px] gap-0.5 overflow-hidden rounded-full">
                      <div className="rounded-full bg-pro" style={{ width: '25%' }} />
                      <div className="rounded-full bg-carb" style={{ width: '45%' }} />
                      <div className="rounded-full bg-fat" style={{ width: '30%' }} />
                    </div>
                    <div className="mt-3.5 flex flex-wrap justify-center gap-5">
                      <SplitLegend color="bg-pro" label={t.mProtein} value={`${preview.proteinG} ${t.g}`} />
                      <SplitLegend color="bg-carb" label={t.mCarbs} value={`${preview.carbsG} ${t.g}`} />
                      <SplitLegend color="bg-fat" label={t.mFat} value={`${preview.fatG} ${t.g}`} />
                    </div>
                  </>
                )}
                {submitOnboarding.isError && (
                  <p className="mt-4 text-[12.5px] text-fat">{t.app.error}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            className={cn(
              'rounded-xl border border-line2 px-[18px] py-3 text-[13px] font-medium text-tx2 transition-colors hover:bg-surf hover:text-tx',
              step === 0 && 'invisible',
            )}
          >
            {t.onBack}
          </button>
          <div className="flex-1" />
          {step < 3 ? (
            <Button onClick={goNext} size="lg">
              {t.onNext}
            </Button>
          ) : step === 3 ? (
            <>
              <button
                type="button"
                onClick={skipAiStep}
                className="rounded-xl px-[14px] py-3 text-[13px] font-medium text-tx2 transition-colors hover:text-tx"
              >
                {t.app.aiOnboardingSkip}
              </button>
              <Button onClick={saveAiKeyAndContinue} size="lg" disabled={!aiApiKey.trim() || setAiKey.isPending}>
                {t.app.aiOnboardingSave}
              </Button>
            </>
          ) : (
            <Button onClick={onSubmit} size="lg" disabled={submitOnboarding.isPending}>
              {t.onStart}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  unit,
  error,
  children,
}: {
  label: string
  unit?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center gap-3.5 bg-surf px-[18px] py-3.5">
      <span className="flex-1 text-[13.5px] text-tx2">{label}</span>
      <span className="flex items-baseline gap-1.5">
        {children}
        {unit && <span className="text-[11.5px] text-tx3">{unit}</span>}
      </span>
      {error && <span className="text-[10.5px] text-fat">{error}</span>}
    </div>
  )
}

function SplitLegend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-tx2">
      <span className={cn('h-[7px] w-[7px] rounded-sm', color)} />
      {label} <span className="font-mono text-[11.5px] text-tx">{value}</span>
    </span>
  )
}
