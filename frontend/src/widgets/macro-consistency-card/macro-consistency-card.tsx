import { useTranslation } from '@/shared/i18n'
import { useMountedTransition } from '@/shared/lib/use-mounted-transition'
import { macroPercent } from '@/entities/meal/lib/helpers'
import type { NutritionDailyDto } from '@/shared/api/types'

/**
 * Shows today's macro-vs-target split. DESIGN_MAPPING's Progress screen shows
 * a period *average*, but the Phase 1 `NutritionWeeklyPointDto` contract only
 * carries total calories per day (no per-day macro breakdown) — so this
 * renders today's real macros rather than fabricating a multi-day average.
 */
export function MacroConsistencyCard({ daily }: { daily: NutritionDailyDto }) {
  const { t } = useTranslation()
  const mounted = useMountedTransition()

  const rows = [
    { label: t.mProtein, color: 'var(--pro)', ...daily.protein },
    { label: t.mCarbs, color: 'var(--carb)', ...daily.carbs },
    { label: t.mFat, color: 'var(--fat)', ...daily.fat },
  ]

  return (
    <section className="rounded-[20px] border border-line bg-surf p-5 md:p-[22px]">
      <div className="text-[14px] font-semibold tracking-[-.01em]">{t.pgMacroT}</div>
      <div className="mt-1 font-mono text-[10px] tracking-[.1em] text-tx3">{t.pgTargetW}</div>
      <div className="mt-5 flex flex-col gap-[19px]">
        {rows.map((r) => {
          const pct = macroPercent(r.consumed, r.target)
          return (
            <div key={r.label}>
              <div className="mb-2 flex items-baseline justify-between gap-2.5">
                <span className="truncate text-[12.5px] text-tx2">{r.label}</span>
                <span className="flex-none font-mono text-[11.5px]">
                  <span className="text-tx">{Math.round(r.consumed)}</span>
                  <span className="text-tx3"> / {Math.round(r.target)} {t.g}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full transition-[width] duration-1000"
                  style={{ background: r.color, width: mounted ? `${pct}%` : '0%' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
