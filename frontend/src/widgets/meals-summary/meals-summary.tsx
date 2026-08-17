import { useTranslation } from '@nutriai/shared/i18n'
import { fmtNumber, clamp } from '@nutriai/shared/lib/format'
import { useMountedTransition } from '@/shared/lib/use-mounted-transition'
import type { NutritionDailyDto } from '@nutriai/shared/api/types'

export function MealsSummary({ daily }: { daily: NutritionDailyDto }) {
  const { t, lang } = useTranslation()
  const mounted = useMountedTransition()
  const pct = clamp(Math.round((daily.consumed / (daily.target || 1)) * 100), 0, 100)

  return (
    <section className="relative mt-[22px] overflow-hidden rounded-[20px] border border-line bg-surf p-5 md:p-[22px]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(90% 140% at 0 0, var(--accT), transparent 58%)' }}
      />
      <div className="relative flex flex-wrap items-end gap-6">
        <div className="min-w-[200px] flex-1">
          <div className="font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.mpToday}</div>
          <div className="mt-2 flex items-baseline gap-[7px]">
            <span className="text-[32px] font-medium leading-none tracking-[-.035em] tabular-nums md:text-[38px]">
              {fmtNumber(daily.consumed, lang)}
            </span>
            <span className="text-[14px] text-tx3 tabular-nums md:text-[15px]">
              / {fmtNumber(daily.target, lang)} {t.kcal}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <MacroPill color="var(--pro)" bg="bg-proT" label={t.mProtein} value={`${Math.round(daily.protein.consumed)} ${t.g}`} />
          <MacroPill color="var(--carb)" bg="bg-carbT" label={t.mCarbs} value={`${Math.round(daily.carbs.consumed)} ${t.g}`} />
          <MacroPill color="var(--fat)" bg="bg-fatT" label={t.mFat} value={`${Math.round(daily.fat.consumed)} ${t.g}`} />
        </div>
      </div>
      <div className="relative mt-[18px] h-[7px] overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full transition-[width] duration-1000"
          style={{
            background: 'linear-gradient(90deg, var(--accD), var(--acc))',
            width: mounted ? `${pct}%` : '0%',
            boxShadow: '0 0 12px var(--accG)',
          }}
        />
      </div>
      <div className="relative mt-2 flex justify-between font-mono text-[10px] tracking-[.1em] text-tx3">
        <span>{pct}%</span>
        <span>
          {fmtNumber(Math.max(0, daily.remaining), lang)} {t.kcal} {t.remainL}
        </span>
      </div>
    </section>
  )
}

function MacroPill({ color, bg, label, value }: { color: string; bg: string; label: string; value: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] ${bg}`}
      style={{ color }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: color }} />
      {label} {value}
    </span>
  )
}
