import { useTranslation } from '@nutriai/shared/i18n'
import { fmtNumber } from '@nutriai/shared/lib/format'
import { MEAL_TYPE_EMOJI } from '@/entities/meal/lib/helpers'
import { macroBarWidths } from '@/entities/message/lib/helpers'
import { AddMealFromAiButton } from '@/features/add-meal-from-ai/add-meal-from-ai-button'
import type { NutritionAnalysisDto } from '@nutriai/shared/api/types'

export function NutritionResultCard({
  analysis,
  added,
  onAdded,
}: {
  analysis: NutritionAnalysisDto
  added: boolean
  onAdded: () => void
}) {
  const { t, lang } = useTranslation()
  const widths = macroBarWidths(analysis.total)

  const rows = [
    { l: t.mProtein, v: analysis.total.protein, w: widths.protein, col: 'var(--pro)' },
    { l: t.mCarbs, v: analysis.total.carbs, w: widths.carbs, col: 'var(--carb)' },
    { l: t.mFat, v: analysis.total.fat, w: widths.fat, col: 'var(--fat)' },
  ]

  return (
    <div className="mt-3.5 max-w-[400px] overflow-hidden rounded-[18px] border border-line bg-surf shadow-card">
      <div className="flex items-center gap-2.5 border-b border-line px-4 pb-3.5 pt-[15px]">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-accT text-[17px]">
          {MEAL_TYPE_EMOJI[analysis.mealType]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-semibold tracking-[-.01em]">{analysis.mealName}</div>
          <div className="mt-0.5 font-mono text-[10.5px] text-tx3">
            {analysis.items.length} {t.itemsN}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[21px] font-medium leading-none tracking-[-.025em] tabular-nums">
            {fmtNumber(analysis.total.calories, lang)}
          </div>
          <div className="mt-[3px] font-mono text-[9.5px] tracking-[.1em] text-tx3">{t.kcal}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3.5">
        {rows.map((r) => (
          <div key={r.l} className="flex items-center gap-2.5">
            <span className="w-[78px] flex-none truncate text-[12px] text-tx2">{r.l}</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
              <span className="block h-full rounded-full" style={{ width: `${r.w}%`, background: r.col }} />
            </span>
            <span className="flex-none font-mono text-[11.5px] tabular-nums">
              {Math.round(r.v)} {t.g}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <AddMealFromAiButton analysis={analysis} added={added} onAdded={onAdded} />
      </div>
    </div>
  )
}
