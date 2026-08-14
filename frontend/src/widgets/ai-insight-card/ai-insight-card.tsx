import { Link } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'
import { fmtNumber } from '@/shared/lib/format'
import type { NutritionDailyDto } from '@/shared/api/types'

export function AiInsightCard({ daily, insight }: { daily: NutritionDailyDto; insight: string | null }) {
  const { t, lang } = useTranslation()

  const remaining = [
    { label: t.mProtein, color: 'var(--pro)', value: daily.protein.target - daily.protein.consumed },
    { label: t.mCarbs, color: 'var(--carb)', value: daily.carbs.target - daily.carbs.consumed },
    { label: t.mFat, color: 'var(--fat)', value: daily.fat.target - daily.fat.consumed },
  ]

  return (
    <section
      className="relative overflow-hidden rounded-[22px] p-px"
      style={{ background: 'linear-gradient(150deg, var(--accG), var(--line) 42%, var(--line))' }}
    >
      <div className="relative overflow-hidden rounded-[21px] bg-surf px-[22px] pb-5 pt-[22px]">
        <div
          className="pointer-events-none absolute -right-0 -top-[30%] h-[260px] w-[260px] animate-drift rounded-full opacity-70 blur-[30px]"
          style={{ background: 'radial-gradient(circle, var(--accG), transparent 65%)' }}
        />
        <div className="relative flex items-center gap-[11px]">
          <div className="relative h-[34px] w-[34px] flex-none">
            <div className="absolute -inset-1 animate-halo rounded-full blur-[8px]" style={{ background: 'var(--accG)' }} />
            <div
              className="relative h-[34px] w-[34px] rounded-full"
              style={{
                background: 'radial-gradient(circle at 32% 28%, var(--acc), var(--accD) 58%, var(--surf2))',
                boxShadow: 'inset 0 0 8px rgba(255,255,255,.28)',
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-semibold tracking-[-.01em]">{t.aiTitle}</div>
            <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[9.5px] tracking-[.13em] text-tx3">
              <span className="h-1 w-1 animate-pulse-soft rounded-full bg-acc" />
              {t.aiBadge}
            </div>
          </div>
        </div>
        <p className="relative m-0 mt-4 text-pretty font-serif text-[18px] leading-[1.42] tracking-[-.005em] md:text-[19px]">
          {insight ?? t.aiBadge}
        </p>
        <div className="relative mt-[18px] flex flex-wrap gap-2">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 rounded-[11px] bg-acc px-[15px] py-2.5 text-[12.5px] font-semibold text-[#04120e] transition-[filter] hover:brightness-[1.08] active:scale-[0.97]"
          >
            {t.aiCta}
            <span className="font-mono">→</span>
          </Link>
          <Link
            to="/meals"
            className="rounded-[11px] border border-line2 px-[15px] py-2.5 text-[12.5px] font-medium text-tx2 transition-colors hover:bg-surf2 hover:text-tx"
          >
            {t.aiAlt}
          </Link>
        </div>
        <div className="relative mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(84px,1fr))] gap-3 border-t border-line pt-3.5">
          {remaining.map((r) => (
            <div key={r.label}>
              <div className="font-mono text-[9px] tracking-[.13em] text-tx3">{r.label}</div>
              <div className="mt-[3px] text-[13px] font-medium" style={{ color: r.color }}>
                {r.value >= 0 ? '−' : '+'}
                {fmtNumber(Math.abs(r.value), lang)} {t.g}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
