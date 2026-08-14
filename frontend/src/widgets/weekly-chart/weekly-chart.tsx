import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTranslation } from '@/shared/i18n'
import { fmtNumber } from '@/shared/lib/format'
import type { Dict } from '@/shared/i18n/types'
import type { Language, NutritionWeeklyPointDto } from '@/shared/api/types'

interface ChartTooltipProps {
  active?: boolean
  payload?: { payload: NutritionWeeklyPointDto }[]
  label?: string
  target: number
  t: Dict
  lang: Language
}

function ChartTooltipContent({ active, payload, label, target, t, lang }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const delta = point.consumed - target
  const deltaColor = delta === 0 ? 'var(--acc)' : delta > 0 ? 'var(--fat)' : 'var(--carb)'
  const deltaLabel =
    delta === 0 ? t.onT : `${fmtNumber(Math.abs(delta), lang)} ${t.kcal} ${delta > 0 ? t.overT : t.underT}`
  return (
    <div className="min-w-[132px] rounded-[13px] border border-line2 bg-surf2 px-3.5 py-2.5 shadow-card">
      <div className="font-mono text-[9.5px] tracking-[.14em] text-tx3">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-[19px] font-medium tracking-[-.02em]">{fmtNumber(point.consumed, lang)}</span>
        <span className="text-[11px] text-tx3">{t.kcal}</span>
      </div>
      <div
        className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[11.5px]"
        style={{ color: deltaColor }}
      >
        <span className="h-[5px] w-[5px] rounded-full" style={{ background: deltaColor }} />
        {deltaLabel}
      </div>
    </div>
  )
}

export function WeeklyChart({ data }: { data: NutritionWeeklyPointDto[] }) {
  const { t, lang } = useTranslation()
  const target = data[0]?.target ?? 2000
  const todayIso = new Date().toISOString().slice(0, 10)

  return (
    <section className="mt-[34px] rounded-[20px] border border-line bg-surf px-5 pb-3.5 pt-[22px] md:px-6">
      <div className="mb-1.5 flex flex-wrap items-start gap-4">
        <div className="min-w-[180px] flex-1">
          <h2 className="m-0 text-[14px] font-semibold tracking-[-.01em]">{t.chartTitle}</h2>
          <p className="m-0 mt-1 text-[12.5px] text-tx3">{t.chartSub}</p>
        </div>
        <div className="flex items-center gap-4 text-[11.5px] text-tx2">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px] bg-acc" />
            {t.chartConsumed}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-3.5 border-t border-dashed border-tx3" />
            {t.chartTarget}
          </span>
        </div>
      </div>
      <div className="h-[232px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }} barCategoryGap="24%">
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--tx3)', fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fill: 'var(--tx3)', fontSize: 9.5, fontFamily: 'IBM Plex Mono, monospace' }}
              tickFormatter={(v: number) => fmtNumber(v, lang)}
            />
            <ReferenceLine y={target} stroke="var(--tx3)" strokeDasharray="4 5" />
            <Tooltip
              cursor={{ fill: 'var(--surf2)' }}
              content={(props: object) => (
                <ChartTooltipContent {...(props as Partial<ChartTooltipProps>)} target={target} t={t} lang={lang} />
              )}
            />
            <Bar dataKey="consumed" radius={[9, 9, 0, 0]} maxBarSize={44}>
              {data.map((d) => (
                <Cell key={d.date} fill={d.date === todayIso ? 'var(--acc)' : 'var(--tx2)'} fillOpacity={d.date === todayIso ? 1 : 0.42} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
