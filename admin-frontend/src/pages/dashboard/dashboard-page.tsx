import { useState } from 'react'
import { Activity, AlertTriangle, Bot, Salad, UserPlus, Users } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAdminDashboard } from '@/shared/api/dashboard'
import { AdminHeader } from '@/shared/ui/admin-header'
import { KpiCard } from '@/shared/ui/kpi-card'
import { AdminChartCard, AdminChartTooltip, adminChartAxis, adminChartColors, adminChartGrid } from '@/shared/ui/chart-card'
import { AdminCard, AdminCardHeader, AdminCardTitle } from '@/shared/ui/card'
import { DateRangePicker } from '@/shared/ui/date-range-picker'
import { AdminErrorState } from '@/shared/ui/error-state'
import { KpiGridSkeleton, ChartSkeleton } from '@/shared/ui/skeleton'
import { useAdminTranslation } from '@/shared/i18n/use-admin-translation'
import { fmtNumber } from '@nutriai/shared/lib/format'
import type { Range } from '@/shared/api/types'

export function DashboardPage() {
  const { t, lang } = useAdminTranslation()
  const [range, setRange] = useState<Range>('7d')
  const { data, isLoading, isError, refetch, isFetching } = useAdminDashboard(range)

  const rangeOptions = [
    { value: '7d' as Range, label: t.ranges.d7 },
    { value: '30d' as Range, label: t.ranges.d30 },
    { value: '90d' as Range, label: t.ranges.d90 },
    { value: '1y' as Range, label: t.ranges.y1 },
  ]

  return (
    <div>
      <AdminHeader
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        actions={<DateRangePicker value={range} options={rangeOptions} onChange={setRange} />}
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <KpiGridSkeleton />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      )}

      {isError && !isLoading && <AdminErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="flex flex-col gap-4" style={{ opacity: isFetching ? 0.7 : 1, transition: 'opacity .15s' }}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard
              index={0}
              label={t.dashboard.kpiTotalUsers}
              value={fmtNumber(data.kpis.totalUsers.value, lang)}
              deltaPct={data.kpis.totalUsers.deltaPct}
              icon={<Users className="h-3.5 w-3.5" />}
              compareLabel={t.common.vsPrevious}
            />
            <KpiCard
              index={1}
              label={t.dashboard.kpiActiveToday}
              value={fmtNumber(data.kpis.activeUsersToday.value, lang)}
              deltaPct={data.kpis.activeUsersToday.deltaPct}
              icon={<Activity className="h-3.5 w-3.5" />}
              compareLabel={t.common.vsPrevious}
            />
            <KpiCard
              index={2}
              label={t.dashboard.kpiNewToday}
              value={fmtNumber(data.kpis.newUsersToday.value, lang)}
              deltaPct={data.kpis.newUsersToday.deltaPct}
              icon={<UserPlus className="h-3.5 w-3.5" />}
              compareLabel={t.common.vsPrevious}
            />
            <KpiCard
              index={3}
              label={t.dashboard.kpiTotalMeals}
              value={fmtNumber(data.kpis.totalMeals.value, lang)}
              deltaPct={data.kpis.totalMeals.deltaPct}
              icon={<Salad className="h-3.5 w-3.5" />}
              compareLabel={t.common.vsPrevious}
            />
            <KpiCard
              index={4}
              label={t.dashboard.kpiAiRequestsToday}
              value={fmtNumber(data.kpis.aiRequestsToday.value, lang)}
              deltaPct={data.kpis.aiRequestsToday.deltaPct}
              icon={<Bot className="h-3.5 w-3.5" />}
              compareLabel={t.common.vsPrevious}
            />
            <KpiCard
              index={5}
              label={t.dashboard.kpiAiErrorRate}
              value={`${data.kpis.aiErrorRateToday.value.toFixed(1)}%`}
              deltaPct={data.kpis.aiErrorRateToday.deltaPct}
              invertTrend
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              compareLabel={t.common.vsPrevious}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdminChartCard title={t.dashboard.userGrowthTitle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userGrowth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={adminChartGrid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({ name: String(p.name), value: Number(p.value), color: p.color as string }))}
                      />
                    )}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: adminChartAxis }} />
                  <Line type="monotone" dataKey="newUsers" name={t.dashboard.newUsers} stroke={adminChartColors[0]} strokeWidth={2} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    name={t.dashboard.activeUsers}
                    stroke={adminChartColors[2]}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard title={t.dashboard.mealActivityTitle} subtitle={t.dashboard.mealsPerDay}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mealActivity.perDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={adminChartGrid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({ name: t.dashboard.mealsPerDay, value: Number(p.value), color: adminChartColors[0] }))}
                      />
                    )}
                  />
                  <Bar dataKey="value" name={t.dashboard.mealsPerDay} fill={adminChartColors[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </AdminChartCard>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle>{t.dashboard.aiUsageTitle}</AdminCardTitle>
              </AdminCardHeader>
              <dl className="grid grid-cols-2 gap-3 text-[12px]">
                <Stat label={t.dashboard.aiUsageToday} value={fmtNumber(data.aiUsage.requestsToday, lang)} />
                <Stat label={t.dashboard.aiUsageWeek} value={fmtNumber(data.aiUsage.requestsThisWeek, lang)} />
                <Stat label={t.dashboard.aiUsageMonth} value={fmtNumber(data.aiUsage.requestsThisMonth, lang)} />
                <Stat label={t.dashboard.aiAvgResponse} value={`${fmtNumber(data.aiUsage.avgResponseTimeMs, lang)} ms`} />
                <Stat label={t.dashboard.aiSuccess} value={fmtNumber(data.aiUsage.successCount, lang)} tone="good" />
                <Stat label={t.dashboard.aiFailure} value={fmtNumber(data.aiUsage.failureCount, lang)} tone="critical" />
              </dl>
              <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--adm-border)' }}>
                <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-wide" style={{ color: 'var(--adm-text-3)' }}>
                  {t.dashboard.aiTokens}
                </div>
                {data.aiUsage.tokenUsage ? (
                  <dl className="grid grid-cols-3 gap-2 text-[11.5px]">
                    <Stat compact label={t.dashboard.aiTokensPrompt} value={fmtNumber(data.aiUsage.tokenUsage.promptTokens, lang)} />
                    <Stat compact label={t.dashboard.aiTokensCompletion} value={fmtNumber(data.aiUsage.tokenUsage.completionTokens, lang)} />
                    <Stat compact label={t.dashboard.aiTokensTotal} value={fmtNumber(data.aiUsage.tokenUsage.totalTokens, lang)} />
                  </dl>
                ) : (
                  <p className="text-[11.5px]" style={{ color: 'var(--adm-text-3)' }}>
                    {t.dashboard.aiTokensUnavailable}
                  </p>
                )}
              </div>
            </AdminCard>

            <AdminChartCard title={t.dashboard.userGoalsTitle} height={200}>
              {data.userGoals.length === 0 ? (
                <NoDataMini />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.userGoals} dataKey="count" nameKey="goal" innerRadius={44} outerRadius={70} paddingAngle={2}>
                      {data.userGoals.map((entry, i) => (
                        <Cell key={entry.goal} fill={adminChartColors[i % adminChartColors.length]} stroke="var(--adm-surface)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => (
                        <AdminChartTooltip
                          active={active}
                          items={payload?.map((p) => {
                            const idx = data.userGoals.findIndex((g) => g.goal === (p.payload as { goal: string }).goal)
                            return {
                              name: String(p.name),
                              value: Number((p.payload as { percent: number }).percent),
                              color: adminChartColors[idx % adminChartColors.length],
                            }
                          })}
                          formatValue={(v) => `${v}%`}
                        />
                      )}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: adminChartAxis }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </AdminChartCard>

            <AdminChartCard title={t.dashboard.languageDistributionTitle} height={200}>
              {data.languageDistribution.length === 0 ? (
                <NoDataMini />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.languageDistribution}
                      dataKey="count"
                      nameKey="language"
                      innerRadius={44}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {data.languageDistribution.map((entry, i) => (
                        <Cell
                          key={entry.language}
                          fill={adminChartColors[i % adminChartColors.length]}
                          stroke="var(--adm-surface)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => (
                        <AdminChartTooltip
                          active={active}
                          items={payload?.map((p) => {
                            const idx = data.languageDistribution.findIndex(
                              (g) => g.language === (p.payload as { language: string }).language,
                            )
                            return {
                              name: String(p.name),
                              value: Number((p.payload as { percent: number }).percent),
                              color: adminChartColors[idx % adminChartColors.length],
                            }
                          })}
                          formatValue={(v) => `${v}%`}
                        />
                      )}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: adminChartAxis }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </AdminChartCard>
          </div>

          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t.dashboard.recentActivityTitle}</AdminCardTitle>
            </AdminCardHeader>
            {data.recentActivity.length === 0 ? (
              <p className="py-6 text-center text-[12px]" style={{ color: 'var(--adm-text-3)' }}>
                {t.dashboard.noActivity}
              </p>
            ) : (
              <ul className="flex flex-col">
                {data.recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-b py-2 text-[12px] last:border-b-0"
                    style={{ borderColor: 'var(--adm-border)' }}
                  >
                    <span style={{ color: 'var(--adm-text)' }}>
                      {item.label}
                      {item.userName && <span style={{ color: 'var(--adm-text-3)' }}> — {item.userName}</span>}
                    </span>
                    <span className="adm-mono flex-none text-[11px]" style={{ color: 'var(--adm-text-3)' }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone, compact }: { label: string; value: string; tone?: 'good' | 'critical'; compact?: boolean }) {
  return (
    <div>
      <div className={compact ? 'text-[10px]' : 'text-[10.5px]'} style={{ color: 'var(--adm-text-3)' }}>
        {label}
      </div>
      <div
        className={`adm-mono font-semibold ${compact ? 'text-[12px]' : 'text-[14px]'}`}
        style={{ color: tone === 'good' ? 'var(--adm-good)' : tone === 'critical' ? 'var(--adm-critical)' : 'var(--adm-text)' }}
      >
        {value}
      </div>
    </div>
  )
}

function NoDataMini() {
  const { t } = useAdminTranslation()
  return (
    <div className="flex h-full items-center justify-center text-[12px]" style={{ color: 'var(--adm-text-3)' }}>
      {t.common.noData}
    </div>
  )
}
