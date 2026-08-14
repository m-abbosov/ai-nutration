import { useTranslation } from '@/shared/i18n'
import { useMountedTransition } from '@/shared/lib/use-mounted-transition'
import { macroPercent } from '@/entities/meal/lib/helpers'
import type { NutritionDailyDto } from '@/shared/api/types'

export function MacroOverview({ daily }: { daily: NutritionDailyDto }) {
  const { t } = useTranslation()
  const mounted = useMountedTransition()

  const macros = [
    { key: 'protein', label: t.mProtein, color: 'var(--pro)', bg: 'bg-proT', ...daily.protein },
    { key: 'carbs', label: t.mCarbs, color: 'var(--carb)', bg: 'bg-carbT', ...daily.carbs },
    { key: 'fat', label: t.mFat, color: 'var(--fat)', bg: 'bg-fatT', ...daily.fat },
  ]

  return (
    <section className="mt-[30px]">
      <div className="mb-[13px] flex items-baseline justify-between">
        <h2 className="m-0 text-[13px] font-semibold tracking-[.02em]">{t.macroTitle}</h2>
        <span className="font-mono text-[10px] tracking-[.12em] text-tx3">{t.ofTarget}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(196px,1fr))] gap-3.5">
        {macros.map((m, i) => {
          const pct = macroPercent(m.consumed, m.target)
          return (
            <div
              key={m.key}
              className="animate-fu rounded-[17px] border border-line bg-surf p-4"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-center gap-2.5">
                <div className={`grid h-[26px] w-[26px] place-items-center rounded-[9px] ${m.bg}`}>
                  <span className="h-[9px] w-[9px] rounded-full" style={{ background: m.color }} />
                </div>
                <span className="flex-1 truncate text-[13px] font-medium">{m.label}</span>
                <span className="font-mono text-[11px]" style={{ color: m.color }}>
                  {pct}%
                </span>
              </div>
              <div className="mt-3.5 flex items-baseline gap-1">
                <span className="font-mono text-[25px] font-medium tracking-[-.025em]">{Math.round(m.consumed)}</span>
                <span className="font-mono text-[13px] text-tx3">
                  / {Math.round(m.target)} {t.g}
                </span>
              </div>
              <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-1000"
                  style={{ background: m.color, width: mounted ? `${pct}%` : '0%' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
