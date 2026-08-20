import { useState } from "react";

import { fmtNumber } from "@nutriai/shared/lib/format";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAdminFitness } from "@/shared/api/fitness";
import type { Range } from "@/shared/api/types";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { AdminHeader } from "@/shared/ui/admin-header";
import { AdminCard, AdminCardHeader, AdminCardTitle } from "@/shared/ui/card";
import { AdminChartCard, AdminChartTooltip, adminChartAxis, adminChartColors, adminChartGrid } from "@/shared/ui/chart-card";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { AdminEmptyState, AdminErrorState } from "@/shared/ui/error-state";
import { KpiCard } from "@/shared/ui/kpi-card";
import { ChartSkeleton, KpiGridSkeleton } from "@/shared/ui/skeleton";

export function FitnessPage() {
  const { t, lang } = useAdminTranslation();
  const [range, setRange] = useState<Range>("30d");
  const { data, isLoading, isError, refetch } = useAdminFitness(range);

  const rangeOptions = [
    { value: "7d" as Range, label: t.ranges.d7 },
    { value: "30d" as Range, label: t.ranges.d30 },
    { value: "90d" as Range, label: t.ranges.d90 },
    { value: "1y" as Range, label: t.ranges.y1 },
  ];

  return (
    <div>
      <AdminHeader
        title={t.fitness.title}
        subtitle={t.fitness.subtitle}
        actions={<DateRangePicker value={range} options={rangeOptions} onChange={setRange} />}
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <KpiGridSkeleton count={4} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      )}

      {isError && !isLoading && <AdminErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard index={0} label={t.fitness.totalWorkouts} value={fmtNumber(data.totals.total, lang)} deltaPct={null} />
            <KpiCard index={1} label={t.fitness.today} value={fmtNumber(data.totals.today, lang)} deltaPct={null} />
            <KpiCard index={2} label={t.fitness.thisWeek} value={fmtNumber(data.totals.thisWeek, lang)} deltaPct={null} />
            <KpiCard index={3} label={t.fitness.thisMonth} value={fmtNumber(data.totals.thisMonth, lang)} deltaPct={null} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label={t.fitness.avgVolume} value={`${fmtNumber(data.averages.volume, lang)} kg`} color={adminChartColors[0]} />
            <StatTile label={t.fitness.avgDuration} value={`${fmtNumber(data.averages.durationMin, lang)} min`} color={adminChartColors[3]} />
            <StatTile label={t.fitness.avgSets} value={fmtNumber(data.averages.setsPerWorkout, lang)} color={adminChartColors[6]} />
            <StatTile label={t.fitness.personalRecords} value={fmtNumber(data.personalRecordsCount, lang)} color={adminChartColors[7]} />
          </div>

          <AdminChartCard title={t.fitness.dailyWorkoutsTitle}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyWorkouts} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={adminChartGrid} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  content={({ active, label, payload }) => (
                    <AdminChartTooltip
                      active={active}
                      label={label}
                      items={payload?.map((p) => ({ name: t.fitness.dailyWorkoutsTitle, value: Number(p.value), color: adminChartColors[0] }))}
                    />
                  )}
                />
                <Bar dataKey="value" fill={adminChartColors[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </AdminChartCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdminChartCard title={t.fitness.categoryDistributionTitle}>
              {data.categoryDistribution.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[12px]" style={{ color: "var(--adm-text-3)" }}>
                  {t.common.noData}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.categoryDistribution} dataKey="count" nameKey="category" innerRadius={50} outerRadius={82} paddingAngle={2}>
                      {data.categoryDistribution.map((entry, i) => (
                        <Cell key={entry.category} fill={adminChartColors[i % adminChartColors.length]} stroke="var(--adm-surface)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => (
                        <AdminChartTooltip
                          active={active}
                          items={payload?.map((p) => {
                            const idx = data.categoryDistribution.findIndex((c) => c.category === (p.payload as { category: string }).category);
                            return {
                              name: String(p.name),
                              value: Number((p.payload as { percent: number }).percent),
                              color: adminChartColors[idx % adminChartColors.length],
                            };
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

            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle>{t.fitness.topExercisesTitle}</AdminCardTitle>
              </AdminCardHeader>
              {data.topExercises.length === 0 ? (
                <AdminEmptyState message={t.fitness.noExercises} />
              ) : (
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--adm-border)" }}>
                      <th className="px-2 py-1.5 text-left text-[10.5px] font-semibold uppercase" style={{ color: "var(--adm-text-3)" }}>
                        {t.fitness.colExercise}
                      </th>
                      <th className="px-2 py-1.5 text-right text-[10.5px] font-semibold uppercase" style={{ color: "var(--adm-text-3)" }}>
                        {t.fitness.colCount}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topExercises.map((ex) => (
                      <tr key={ex.slug} className="border-b last:border-b-0" style={{ borderColor: "var(--adm-border)" }}>
                        <td className="px-2 py-1.5" style={{ color: "var(--adm-text)" }}>
                          {ex.slug}
                        </td>
                        <td className="adm-mono px-2 py-1.5 text-right" style={{ color: "var(--adm-text)" }}>
                          {fmtNumber(ex.count, lang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </AdminCard>
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-[var(--adm-radius-lg)] border p-3" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-[10.5px]" style={{ color: "var(--adm-text-3)" }}>
          {label}
        </span>
      </div>
      <div className="adm-mono mt-1.5 text-[16px] font-semibold" style={{ color: "var(--adm-text)" }}>
        {value}
      </div>
    </div>
  );
}
