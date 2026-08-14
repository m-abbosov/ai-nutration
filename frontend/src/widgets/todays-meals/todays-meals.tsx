import { Link } from 'react-router-dom'
import { useTranslation, localeTags } from '@/shared/i18n'
import { fmtNumber, formatTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import type { MealDto } from '@/shared/api/types'

export function TodaysMeals({ meals }: { meals: MealDto[] }) {
  const { t, lang } = useTranslation()
  const sorted = [...meals].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="m-0 text-[13px] font-semibold tracking-[.02em]">{t.mealsTitle}</h2>
        <Link
          to="/meals"
          className="font-mono text-[10px] tracking-[.12em] text-tx3 transition-colors hover:text-acc"
        >
          {t.viewAll}
        </Link>
      </div>

      {sorted.length === 0 ? (
        <EmptyMealsCard />
      ) : (
        <div className="relative pl-0.5">
          {sorted.map((m, i) => (
            <div key={m.id} className="relative flex gap-4 pb-[22px]">
              <div className="relative flex w-3 flex-none justify-center">
                {i !== sorted.length - 1 && (
                  <div className="absolute bottom-[-14px] top-3.5 w-px bg-line2" />
                )}
                <div
                  className="relative mt-1.5 h-[11px] w-[11px] rounded-full border-2 border-bg"
                  style={{ background: 'var(--acc)', boxShadow: '0 0 0 1px var(--line2)' }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="font-mono text-[11px] text-tx3">{formatTime(m.createdAt, localeTags[lang])}</span>
                  <span className="text-[14px] font-semibold tracking-[-.01em]">
                    {m.emoji ?? '🍽️'} {m.name}
                  </span>
                  <span className="flex-1" />
                  <span className="font-mono text-[12px] text-tx tabular-nums">
                    {fmtNumber(m.calories, lang)} {t.kcal}
                  </span>
                </div>
                {m.items.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {m.items.map((it) => (
                      <div key={it.id} className="flex items-baseline gap-2 text-[13px] text-tx2">
                        <span className="min-w-0 flex-1 truncate">{it.name}</span>
                        <span className="font-mono text-[11px] text-tx3 tabular-nums">
                          {fmtNumber(it.calories, lang)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function EmptyMealsCard() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-line2 px-[15px] py-3.5">
      <span className="min-w-[150px] flex-1 text-[13px] text-tx3">{t.app.mealsEmpty}</span>
      <Button asChild size="sm">
        <Link to="/chat">{t.askAI}</Link>
      </Button>
    </div>
  )
}
