import { useTranslation } from '@nutriai/shared/i18n'
import { fmtDecimal, clamp } from '@nutriai/shared/lib/format'
import { useMountedTransition } from '@/shared/lib/use-mounted-transition'
import type { UserDto } from '@nutriai/shared/api/types'

/** Current vs. goal weight only — no multi-point weight history in Phase 1
 * (DESIGN_MAPPING.md: "Weight trend multi-point chart ... out of scope"). */
export function WeightCard({ user }: { user: UserDto }) {
  const { t, lang } = useTranslation()
  const mounted = useMountedTransition()

  if (!user.weightKg) {
    return (
      <section className="rounded-[20px] border border-line bg-surf p-5 md:p-[22px]">
        <div className="text-[14px] font-semibold tracking-[-.01em]">{t.pgWeight}</div>
        <p className="mt-3 text-[13px] text-tx3">{t.app.onboardingRequired}</p>
      </section>
    )
  }

  const goal = user.goalWeightKg
  const toGoal = goal != null ? Math.abs(user.weightKg - goal) : null
  // Progress bar: how close current weight is to the goal, treating a 10kg
  // span around the goal as "full range" absent any historical starting point.
  const span = 10
  const pct = goal != null ? clamp(Math.round((1 - Math.min(toGoal ?? 0, span) / span) * 100), 0, 100) : 0

  return (
    <section className="rounded-[20px] border border-line bg-surf p-5 md:p-[22px]">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold tracking-[-.01em]">{t.pgWeight}</div>
          <div className="mt-1 font-mono text-[10px] tracking-[.1em] text-tx3">{t.pgWeightSub}</div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-medium tracking-[-.03em] tabular-nums md:text-[24px]">
            {fmtDecimal(user.weightKg, lang)} <span className="text-[13px] text-tx3">{t.pgKg}</span>
          </div>
        </div>
      </div>
      {goal != null && (
        <div className="mt-4 border-t border-line pt-3.5">
          <div className="flex justify-between text-[12px] text-tx2">
            <span>
              {t.pgToGoal} {fmtDecimal(toGoal ?? 0, lang)} {t.pgKg}
            </span>
            <span>
              {t.pgGoalW} {fmtDecimal(goal, lang)} {t.pgKg}
            </span>
          </div>
          <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-acc transition-[width] duration-1000"
              style={{ width: mounted ? `${pct}%` : '0%' }}
            />
          </div>
        </div>
      )}
    </section>
  )
}
