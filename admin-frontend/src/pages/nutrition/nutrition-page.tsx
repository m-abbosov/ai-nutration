import { useState } from "react";

import { fmtNumber } from "@nutriai/shared/lib/format";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAdminNutrition } from "@/shared/api/nutrition";
import type { Range } from "@/shared/api/types";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { AdminHeader } from "@/shared/ui/admin-header";
import { AdminCard, AdminCardHeader, AdminCardTitle } from "@/shared/ui/card";
import { AdminChartCard, AdminChartTooltip, adminChartAxis, adminChartColors, adminChartGrid } from "@/shared/ui/chart-card";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { AdminErrorState } from "@/shared/ui/error-state";
import { AdminEmptyState } from "@/shared/ui/error-state";
import { KpiCard } from "@/shared/ui/kpi-card";
import { ChartSkeleton, KpiGridSkeleton } from "@/shared/ui/skeleton";

export function NutritionPage() {
  const { t, lang } = useAdminTranslation();
  const [range, setRange] = useState<Range>("30d");
  const { data, isLoading, isError, refetch } = useAdminNutrition(range);

  const rangeOptions = [
    { value: "7d" as Range, label: t.ranges.d7 },
    { value: "30d" as Range, label: t.ranges.d30 },
    { value: "90d" as Range, label: t.ranges.d90 },
    { value: "1y" as Range, label: t.ranges.y1 },
  ];

  return (
    <div>
      <AdminHeader
        title={t.nutrition.title}
        subtitle={t.nutrition.subtitle}
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
            <KpiCard index={0} label={t.nutrition.totalMeals} value={fmtNumber(data.totals.total, lang)} deltaPct={null} />
            <KpiCard index={1} label={t.nutrition.today} value={fmtNumber(data.totals.today, lang)} deltaPct={null} />
            <KpiCard index={2} label={t.nutrition.thisWeek} value={fmtNumber(data.totals.thisWeek, lang)} deltaPct={null} />
            <KpiCard index={3} label={t.nutrition.thisMonth} value={fmtNumber(data.totals.thisMonth, lang)} deltaPct={null} />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label={t.nutrition.avgCalories} value={`${fmtNumber(data.averages.calories, lang)} kcal`} color={adminChartColors[0]} />
            <StatTile label={t.nutrition.avgProtein} value={`${fmtNumber(data.averages.protein, lang)} g`} color={adminChartColors[6]} />
            <StatTile label={t.nutrition.avgCarbs} value={`${fmtNumber(data.averages.carbs, lang)} g`} color={adminChartColors[3]} />
            <StatTile label={t.nutrition.avgFat} value={`${fmtNumber(data.averages.fat, lang)} g`} color={adminChartColors[7]} />
          </div>

          <AdminChartCard title={t.nutrition.dailyMealsTitle}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyMeals} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={adminChartGrid} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                <Tooltip
                  content={({ active, label, payload }) => (
                    <AdminChartTooltip
                      active={active}
                      label={label}
                      items={payload?.map((p) => ({ name: t.nutrition.dailyMealsTitle, value: Number(p.value), color: adminChartColors[0] }))}
                    />
                  )}
                />
                <Bar dataKey="value" fill={adminChartColors[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </AdminChartCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdminChartCard title={t.nutrition.caloriesDistributionTitle}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.caloriesDistribution} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={adminChartGrid} vertical={false} />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({ name: t.nutrition.colCount, value: Number(p.value), color: adminChartColors[1] }))}
                      />
                    )}
                  />
                  <Bar dataKey="count" fill={adminChartColors[1]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard title={t.nutrition.mealTypeDistributionTitle}>
              {data.mealTypeDistribution.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[12px]" style={{ color: "var(--adm-text-3)" }}>
                  {t.common.noData}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.mealTypeDistribution} dataKey="count" nameKey="mealType" innerRadius={50} outerRadius={82} paddingAngle={2}>
                      {data.mealTypeDistribution.map((entry, i) => (
                        <Cell key={entry.mealType} fill={adminChartColors[i % adminChartColors.length]} stroke="var(--adm-surface)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => (
                        <AdminChartTooltip
                          active={active}
                          items={payload?.map((p) => {
                            const idx = data.mealTypeDistribution.findIndex((m) => m.mealType === (p.payload as { mealType: string }).mealType);
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
          </div>

          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t.nutrition.topFoodsTitle}</AdminCardTitle>
            </AdminCardHeader>
            {data.topLoggedFoods.length === 0 ? (
              <AdminEmptyState message={t.nutrition.noFoods} />
            ) : (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--adm-border)" }}>
                    <th className="px-2 py-1.5 text-left text-[10.5px] font-semibold uppercase" style={{ color: "var(--adm-text-3)" }}>
                      {t.nutrition.colFood}
                    </th>
                    <th className="px-2 py-1.5 text-right text-[10.5px] font-semibold uppercase" style={{ color: "var(--adm-text-3)" }}>
                      {t.nutrition.colCount}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topLoggedFoods.map((food) => (
                    <tr key={food.name} className="border-b last:border-b-0" style={{ borderColor: "var(--adm-border)" }}>
                      <td className="px-2 py-1.5" style={{ color: "var(--adm-text)" }}>
                        {food.name}
                      </td>
                      <td className="adm-mono px-2 py-1.5 text-right" style={{ color: "var(--adm-text)" }}>
                        {fmtNumber(food.count, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </AdminCard>
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
