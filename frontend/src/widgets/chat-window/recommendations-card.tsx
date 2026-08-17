import { useTranslation } from '@nutriai/shared/i18n'
import { fmtNumber } from '@nutriai/shared/lib/format'
import type { RecommendationDto } from '@nutriai/shared/api/types'

export function RecommendationsCard({ items }: { items: RecommendationDto[] }) {
  const { t, lang } = useTranslation()

  return (
    <div className="mt-3.5 flex max-w-[440px] flex-col gap-2.5">
      {items.map((r, i) => (
        <div key={i} className="rounded-[16px] border border-line bg-surf px-4 py-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13.5px] font-semibold">{r.name}</span>
            <span className="whitespace-nowrap font-mono text-[13px] tabular-nums text-acc">
              {fmtNumber(r.estimatedCalories, lang)} {t.kcal}
            </span>
          </div>
          {(r.protein != null || r.carbs != null || r.fat != null) && (
            <div className="mt-1.5 flex gap-3 font-mono text-[11px] text-tx3">
              {r.protein != null && <span style={{ color: 'var(--pro)' }}>P {r.protein}{t.g}</span>}
              {r.carbs != null && <span style={{ color: 'var(--carb)' }}>C {r.carbs}{t.g}</span>}
              {r.fat != null && <span style={{ color: 'var(--fat)' }}>F {r.fat}{t.g}</span>}
            </div>
          )}
          <p className="m-0 mt-2 text-[12.5px] leading-[1.5] text-tx2">{r.reason}</p>
        </div>
      ))}
    </div>
  )
}
