import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@nutriai/shared/i18n'
import { ThemeToggle } from '@/features/theme-toggle/theme-toggle'
import { LogoMark } from '@/shared/ui/nav-icons'
import { CALCS, CALC_CATEGORY_COLOR, findCalculator } from '@/entities/calculator/lib/calculators'

const FILTER_LABEL_KEY = {
  health: 'filterHealth',
  nutrition: 'filterNutrition',
  fitness: 'filterFitness',
} as const

export function CalculatorShell({
  calcId,
  inputs,
  results,
}: {
  calcId: string
  inputs: ReactNode
  results: ReactNode
}) {
  const { t } = useTranslation()
  const calc = findCalculator(calcId)
  const meta = t.landing.calculators[calcId]
  const related = calc ? CALCS.filter((c) => c.cat === calc.cat && c.id !== calcId).slice(0, 3) : []

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2.5 px-5 py-[13px] md:px-8">
          <Link to="/" className="flex items-center gap-2.5 text-tx">
            <LogoMark />
            <span className="text-[16px] font-semibold tracking-[-.015em]">
              AI <span className="text-acc">Nutrition</span>
            </span>
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] animate-fu px-5 py-10 md:px-8">
        {calc && (
          <div className="font-mono text-[9.5px] tracking-[.18em] text-tx3">
            {t.landing.calc[FILTER_LABEL_KEY[calc.cat]]}
          </div>
        )}
        <h1 className="mt-2.5 text-[28px] font-medium leading-tight tracking-[-.025em] text-balance">{meta?.name}</h1>
        <p className="mt-2 max-w-[60ch] text-[14px] leading-[1.55] text-tx2 text-pretty">{meta?.desc}</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="min-w-0">{inputs}</div>
          <div className="min-w-0">
            <div className="rounded-[22px] border border-line2 bg-bg2 p-6 shadow-card">{results}</div>
          </div>
        </div>

        <p className="mt-8 max-w-[70ch] text-[11.5px] leading-[1.55] text-tx3">{t.calcPages.disclaimer}</p>

        {related.length > 0 && (
          <div className="mt-6">
            <div className="mb-2.5 font-mono text-[9px] tracking-[.16em] text-tx3">{t.calcPages.relatedTitle}</div>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/calculators/${r.id}`}
                  className="inline-flex items-center gap-2 rounded-[11px] border border-line bg-surf px-3.5 py-2.5 text-[12.5px] text-tx2 transition-colors hover:border-line2 hover:text-tx"
                >
                  <span className="h-1.5 w-1.5 rounded-sm" style={{ background: CALC_CATEGORY_COLOR[r.cat] }} />
                  {t.landing.calculators[r.id]?.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export function ResultHero({
  kicker,
  value,
  unit,
  tone,
}: {
  kicker: string
  value: string
  unit?: string
  tone?: { color: string; tint: string; label: string }
}) {
  return (
    <div className="text-center">
      <div className="font-mono text-[9px] tracking-[.18em] text-tx3">{kicker}</div>
      <div
        className="mt-2 text-[46px] font-medium leading-none tracking-[-.04em] [font-variant-numeric:tabular-nums]"
        style={{ color: tone?.color }}
      >
        {value}
        {unit && <span className="ml-1.5 text-[19px] font-normal text-tx2">{unit}</span>}
      </div>
      {tone && (
        <div className="mt-3.5 inline-flex items-center gap-2 rounded-full px-3.5 py-[7px]" style={{ background: tone.tint }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.color }} />
          <span className="text-[12.5px] font-semibold" style={{ color: tone.color }}>
            {tone.label}
          </span>
        </div>
      )}
    </div>
  )
}

export function ResultPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="animate-fi py-10 text-center">
      <div className="relative mx-auto mb-[18px] h-[64px] w-[64px]">
        <div className="animate-halo absolute inset-[-8px] rounded-full blur-[14px]" style={{ background: 'radial-gradient(circle, var(--accG), transparent 66%)' }} />
        <div
          className="absolute inset-[9px] rounded-full"
          style={{ background: 'radial-gradient(circle at 34% 26%, var(--acc), var(--accD) 56%, var(--surf) 96%)', boxShadow: 'inset 0 0 12px rgba(255,255,255,.24)' }}
        />
      </div>
      <div className="text-[15px] font-medium">{title}</div>
      <p className="mx-auto mt-2 max-w-[30ch] text-[13px] leading-[1.55] text-tx2 text-pretty">{body}</p>
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-line2 bg-fatT px-3.5 py-3">
      <span className="mt-px grid h-4 w-4 flex-none place-items-center rounded-full bg-fat text-[11px] font-semibold text-bg">!</span>
      <span className="flex-1 text-[12.5px] leading-[1.5] text-tx">{message}</span>
    </div>
  )
}
