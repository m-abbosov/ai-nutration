import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAdminAnalytics } from '@/admin/shared/api/analytics'
import { AdminHeader } from '@/admin/shared/ui/admin-header'
import { KpiCard } from '@/admin/shared/ui/kpi-card'
import { AdminChartCard, AdminChartTooltip, adminChartAxis, adminChartColors, adminChartGrid } from '@/admin/shared/ui/chart-card'
import { AdminCard, AdminCardHeader, AdminCardTitle } from '@/admin/shared/ui/card'
import { DateRangePicker } from '@/admin/shared/ui/date-range-picker'
import { AdminErrorState } from '@/admin/shared/ui/error-state'
import { KpiGridSkeleton, ChartSkeleton } from '@/admin/shared/ui/skeleton'
import { useAdminTranslation } from '@/admin/shared/i18n/use-admin-translation'
import { fmtNumber } from '@/shared/lib/format'
import type { AnalyticsRange } from '@/admin/shared/api/types'

export function AnalyticsPage() {
  const { t, lang } = useAdminTranslation()
  const [range, setRange] = useState<AnalyticsRange>('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const { data, isLoading, isError, refetch } = useAdminAnalytics({ range, from: customFrom, to: customTo })

  const rangeOptions = [
    { value: '7d' as AnalyticsRange, label: t.ranges.d7 },
    { value: '30d' as AnalyticsRange, label: t.ranges.d30 },
    { value: '90d' as AnalyticsRange, label: t.ranges.d90 },
    { value: 'custom' as AnalyticsRange, label: t.ranges.custom },
  ]

  return (
    <div>
      <AdminHeader
        title={t.analytics.title}
        subtitle={t.analytics.subtitle}
        actions={
          <DateRangePicker
            value={range}
            options={rangeOptions}
            onChange={setRange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomChange={(f, to) => {
              setCustomFrom(f)
              setCustomTo(to)
            }}
          />
        }
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <KpiGridSkeleton count={3} />
          <ChartSkeleton />
        </div>
      )}
      {isError && !isLoading && <AdminErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiCard index={0} label={t.analytics.dau} value={fmtNumber(data.userAnalytics.dau, lang)} deltaPct={null} />
            <KpiCard index={1} label={t.analytics.wau} value={fmtNumber(data.userAnalytics.wau, lang)} deltaPct={null} />
            <KpiCard index={2} label={t.analytics.mau} value={fmtNumber(data.userAnalytics.mau, lang)} deltaPct={null} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdminChartCard title={t.analytics.registrationsTitle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userAnalytics.registrations} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={adminChartGrid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({ name: t.analytics.registrationsTitle, value: Number(p.value), color: adminChartColors[0] }))}
                      />
                    )}
                  />
                  <Line type="monotone" dataKey="value" stroke={adminChartColors[0]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle>{t.analytics.retentionTitle}</AdminCardTitle>
              </AdminCardHeader>
              <div className="grid grid-cols-3 gap-3">
                <RetentionTile label={t.analytics.retentionDay1} value={data.userAnalytics.retention.day1} notEnough={t.analytics.notEnoughData} />
                <RetentionTile label={t.analytics.retentionDay7} value={data.userAnalytics.retention.day7} notEnough={t.analytics.notEnoughData} />
                <RetentionTile label={t.analytics.retentionDay30} value={data.userAnalytics.retention.day30} notEnough={t.analytics.notEnoughData} />
              </div>
              <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--adm-border)' }}>
                <div className="text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
                  {t.analytics.inactiveUsers}
                </div>
                <div className="adm-mono mt-0.5 text-[18px] font-semibold" style={{ color: 'var(--adm-text)' }}>
                  {fmtNumber(data.userAnalytics.inactiveUsers, lang)}
                </div>
              </div>
            </AdminCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle>{t.analytics.nutritionSection}</AdminCardTitle>
              </AdminCardHeader>
              <dl className="grid grid-cols-2 gap-3 text-[12px]">
                <MiniStat label="Kcal" value={fmtNumber(data.nutritionAnalytics.avgCalories, lang)} />
                <MiniStat label="Protein" value={`${fmtNumber(data.nutritionAnalytics.avgProtein, lang)} g`} />
                <MiniStat label="Carbs" value={`${fmtNumber(data.nutritionAnalytics.avgCarbs, lang)} g`} />
                <MiniStat label="Fat" value={`${fmtNumber(data.nutritionAnalytics.avgFat, lang)} g`} />
                <MiniStat label={t.analytics.avgMealsPerUser} value={fmtNumber(data.nutritionAnalytics.avgMealsPerUser, lang)} />
              </dl>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle>{t.analytics.aiSection}</AdminCardTitle>
              </AdminCardHeader>
              <dl className="grid grid-cols-2 gap-3 text-[12px]">
                <MiniStat label={t.ai.totalRequests} value={fmtNumber(data.aiAnalytics.requests, lang)} />
                <MiniStat label={t.ai.successRate} value={`${data.aiAnalytics.successRatePct.toFixed(1)}%`} />
                <MiniStat label={t.ai.colError} value={fmtNumber(data.aiAnalytics.errors, lang)} />
                <MiniStat label={t.ai.avgResponseTime} value={`${fmtNumber(data.aiAnalytics.avgResponseTimeMs, lang)} ms`} />
              </dl>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle>{t.analytics.engagementSection}</AdminCardTitle>
              </AdminCardHeader>
              <dl className="grid grid-cols-1 gap-3 text-[12px]">
                <MiniStat label={t.analytics.mealsPerUser} value={fmtNumber(data.engagement.mealsPerActiveUser, lang)} />
                <MiniStat label={t.analytics.messagesPerUser} value={fmtNumber(data.engagement.aiMessagesPerActiveUser, lang)} />
                <MiniStat label={t.analytics.recommendationUsageRate} value={`${data.engagement.recommendationUsageRatePct.toFixed(1)}%`} />
              </dl>
            </AdminCard>
          </div>
        </div>
      )}
    </div>
  )
}

function RetentionTile({ label, value, notEnough }: { label: string; value: number | null; notEnough: string }) {
  return (
    <div className="rounded-[var(--adm-radius-md)] border p-3 text-center" style={{ borderColor: 'var(--adm-border)' }}>
      <div className="text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
        {label}
      </div>
      {value === null ? (
        <div className="mt-1 text-[12px]" style={{ color: 'var(--adm-text-3)' }}>
          {notEnough}
        </div>
      ) : (
        <div className="adm-mono mt-1 text-[18px] font-semibold" style={{ color: 'var(--adm-text)' }}>
          {value.toFixed(1)}%
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
        {label}
      </div>
      <div className="adm-mono mt-0.5 font-semibold" style={{ color: 'var(--adm-text)' }}>
        {value}
      </div>
    </div>
  )
}
