import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@nutriai/shared/i18n'
import { cn } from '@nutriai/shared/lib/cn'
import {
  CALCS,
  CALC_CATEGORY_COLOR,
  CALC_CATEGORY_TINT,
  type CalculatorCategory,
} from '@/entities/calculator/lib/calculators'
import { CalcIcon, ClearIcon, SearchIcon } from './landing-icons'

type Filter = 'all' | CalculatorCategory

export function LandingCalculators() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const cards = CALCS.filter((c) => {
    if (filter !== 'all' && c.cat !== filter) return false
    if (!q) return true
    const meta = t.landing.calculators[c.id]
    const hay = [meta?.name, meta?.desc, ...(meta?.synonyms ?? [])].join(' ').toLowerCase()
    return hay.includes(q)
  })

  const count = (f: Filter) => (f === 'all' ? CALCS.length : CALCS.filter((c) => c.cat === f).length)
  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t.landing.calc.filterAll },
    { key: 'health', label: t.landing.calc.filterHealth },
    { key: 'nutrition', label: t.landing.calc.filterNutrition },
    { key: 'fitness', label: t.landing.calc.filterFitness },
  ]

  return (
    <section id="calculators" className="mx-auto max-w-[1280px] px-[26px] pb-5 pt-14">
      <div className="mb-[26px] flex flex-wrap items-end gap-6">
        <div className="min-w-[250px] flex-1">
          <div className="font-mono text-[9.5px] tracking-[.18em] text-tx3">{t.landing.calc.kicker}</div>
          <h2 className="mt-3 text-[25px] font-medium leading-[1.12] tracking-[-.028em] text-balance lg:text-[33px]">
            {t.landing.calc.title}
          </h2>
          <p className="mt-2.5 max-w-[48ch] text-[14.5px] text-tx2 text-pretty">{t.landing.calc.sub}</p>
        </div>
        <label className="min-w-[220px] flex-[0_1_300px]">
          <span className="sr-only">{t.landing.calc.searchPh}</span>
          <span className="flex items-center gap-2.5 rounded-[13px] border border-line2 bg-surf px-3.5 py-[11px] transition-colors focus-within:border-acc">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.landing.calc.searchPh}
              aria-label={t.landing.calc.searchPh}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none"
            />
            {query.length > 0 && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear"
                className="grid h-5 w-5 flex-none place-items-center rounded-[6px] text-tx3 hover:bg-surfH hover:text-tx"
              >
                <ClearIcon />
              </button>
            )}
          </span>
        </label>
      </div>

      <div role="tablist" aria-label={t.landing.calc.kicker} className="mb-[22px] flex flex-wrap gap-[7px]">
        {filters.map((f) => {
          const sel = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              role="tab"
              aria-selected={sel}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-[15px] py-2 text-[12.5px] font-medium transition-colors',
                sel ? 'border-acc bg-accT text-acc' : 'border-line2 text-tx2',
              )}
            >
              {f.key !== 'all' && <span className="h-1.5 w-1.5 rounded-sm" style={{ background: CALC_CATEGORY_COLOR[f.key] }} />}
              {f.label}
              <span className="font-mono text-[10px] text-tx3">{count(f.key)}</span>
            </button>
          )
        })}
      </div>

      {cards.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-3.5">
          {cards.map((c) => {
            const meta = t.landing.calculators[c.id]
            return (
              <Link
                key={c.id}
                to={`/calculators/${c.id}`}
                className="group relative flex flex-col gap-[11px] overflow-hidden rounded-[19px] border border-line bg-surf p-[19px] text-tx transition-all hover:-translate-y-[3px] hover:border-line2 hover:shadow-card"
              >
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{ background: `radial-gradient(80% 90% at 100% 0, ${CALC_CATEGORY_TINT[c.cat]}, transparent 62%)` }}
                />
                <span className="relative flex items-start gap-2.5">
                  <span
                    className="grid h-9 w-9 flex-none place-items-center rounded-xl"
                    style={{ background: CALC_CATEGORY_TINT[c.cat], color: CALC_CATEGORY_COLOR[c.cat] }}
                  >
                    <CalcIcon icon={c.icon} dash={c.dash} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold leading-[1.25] tracking-[-.012em] text-pretty [hyphens:auto] [overflow-wrap:anywhere]">
                      {meta?.name}
                    </span>
                    <span className="mt-1 block font-mono text-[9px] tracking-[.14em] text-tx3">
                      {{ health: t.landing.calc.filterHealth, nutrition: t.landing.calc.filterNutrition, fitness: t.landing.calc.filterFitness }[c.cat]}
                    </span>
                  </span>
                  {c.pop && (
                    <span className="mt-0.5 flex-none whitespace-nowrap rounded-[6px] bg-accT px-1.5 py-[3px] font-mono text-[8.5px] tracking-[.1em] text-acc">
                      {t.landing.calc.popular}
                    </span>
                  )}
                </span>
                <span className="relative text-[13px] leading-[1.5] text-tx2 text-pretty">{meta?.desc}</span>
                <span className="relative mt-auto flex items-center gap-[7px] text-[12.5px] font-semibold text-acc">
                  {t.landing.calc.calculate}
                  <span className="font-mono">→</span>
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="animate-fi rounded-[20px] border border-dashed border-line2 px-[26px] py-[52px] text-center">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-[14px] border border-line bg-surf text-tx3">
            <SearchIcon />
          </div>
          <div className="mt-[15px] text-[15px] font-medium">{t.landing.calc.emptyTitle}</div>
          <div className="mt-1.5 text-[13px] text-tx2">{t.landing.calc.emptySub}</div>
          <button
            onClick={() => {
              setQuery('')
              setFilter('all')
            }}
            className="mt-[18px] rounded-[11px] border border-line2 px-[17px] py-2.5 text-[12.5px] font-medium hover:bg-surf"
          >
            {t.landing.calc.emptyReset}
          </button>
        </div>
      )}
    </section>
  )
}
