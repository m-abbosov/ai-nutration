import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTranslation } from '@nutriai/shared/i18n'
import { fmtNumber } from '@nutriai/shared/lib/format'
import type { Dict } from '@nutriai/shared/i18n/types'
import type { Language, NutritionWeeklyPointDto } from '@nutriai/shared/api/types'

interface TrendTooltipProps {
  active?: boolean
  payload?: { payload: NutritionWeeklyPointDto }[]
  label?: string
  t: Dict
  lang: Language
}

function TrendTooltip({ active, payload, label, t, lang }: TrendTooltipProps) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-[13px] border border-line2 bg-surf2 px-3.5 py-2.5 shadow-card">
      <div className="font-mono text-[9.5px] tracking-[.14em] text-tx3">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-[17px] font-medium tracking-[-.02em]">{fmtNumber(point.consumed, lang)}</span>
        <span className="text-[11px] text-tx3">{t.kcal}</span>
      </div>
    </div>
  )
}

export function ProgressTrendChart({
  data,
  range,
  onRangeChange,
}: {
  data: NutritionWeeklyPointDto[]
  range: 7 | 30 | 90
  onRangeChange: (range: 7 | 30 | 90) => void
}) {
  const { t, lang } = useTranslation()
  const target = data[0]?.target ?? 2000
  const avg = data.length ? Math.round(data.reduce((s, p) => s + p.consumed, 0) / data.length) : 0

  const ranges: { value: 7 | 30 | 90; label: string }[] = [
    { value: 7, label: t.r7 },
    { value: 30, label: t.r30 },
    { value: 90, label: t.r90 },
  ]

  return (
    <section className="rounded-[20px] border border-line bg-surf p-5 pb-4 md:p-6">
      <div className="flex flex-wrap items-start gap-5">
        <div className="min-w-[180px] flex-1">
          <div className="text-[14px] font-semibold tracking-[-.01em]">{t.pgTrend}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[26px] font-medium leading-none tracking-[-.03em] tabular-nums md:text-[29px]">
              {fmtNumber(avg, lang)}
            </span>
            <span className="text-[12.5px] text-tx3">
              {t.kcal} · {t.pgAvg}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-[11px] border border-line p-[3px]">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => onRangeChange(r.value)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
                range === r.value ? 'bg-surf2 text-tx' : 'text-tx3'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3.5 h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--acc)" stopOpacity={0.26} />
                <stop offset="1" stopColor="var(--acc)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fill: 'var(--tx3)', fontSize: 9.5, fontFamily: 'IBM Plex Mono, monospace' }}
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
              content={(props: object) => <TrendTooltip {...(props as Partial<TrendTooltipProps>)} t={t} lang={lang} />}
            />
            <Area
              type="monotone"
              dataKey="consumed"
              stroke="var(--acc)"
              strokeWidth={2.2}
              fill="url(#areaG)"
              dot={{ r: 2.2, fill: 'var(--acc)', strokeWidth: 0 }}
              activeDot={{ r: 4, fill: 'var(--acc)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
