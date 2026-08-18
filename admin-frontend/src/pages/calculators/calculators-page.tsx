import { useState } from "react";

import { fmtNumber } from "@nutriai/shared/lib/format";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAdminCalculatorOverview, useAdminCalculatorUsage } from "@/shared/api/calculators";
import type { AdminCalculatorUsageListItemDto, Range } from "@/shared/api/types";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { AdminHeader } from "@/shared/ui/admin-header";
import { AdminChartCard, AdminChartTooltip, adminChartAxis, adminChartColors, adminChartGrid } from "@/shared/ui/chart-card";
import { DataTable, type DataTableColumn } from "@/shared/ui/data-table";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { DetailDrawer } from "@/shared/ui/detail-drawer";
import { AdminEmptyState, AdminErrorState } from "@/shared/ui/error-state";
import { FilterBar } from "@/shared/ui/filter-bar";
import { KpiCard } from "@/shared/ui/kpi-card";
import { AdminSelect, AdminSelectContent, AdminSelectItem, AdminSelectTrigger, AdminSelectValue } from "@/shared/ui/select";
import { ChartSkeleton, KpiGridSkeleton } from "@/shared/ui/skeleton";

const PAGE_SIZE = 20;

const CALCULATOR_IDS = ["bmi", "bodyfat", "ideal", "bmr", "tdee", "calories", "macros", "protein", "water", "pace", "burned", "orm", "hr", "lbm"];

export function CalculatorsPage() {
  const { t, lang } = useAdminTranslation();
  const [range, setRange] = useState<Range>("7d");
  const [page, setPage] = useState(1);
  const [calculatorId, setCalculatorId] = useState("");
  const [openRow, setOpenRow] = useState<AdminCalculatorUsageListItemDto | null>(null);

  const overview = useAdminCalculatorOverview(range);
  const usage = useAdminCalculatorUsage({ page, pageSize: PAGE_SIZE, calculatorId: calculatorId || undefined });

  const rangeOptions = [
    { value: "7d" as Range, label: t.ranges.d7 },
    { value: "30d" as Range, label: t.ranges.d30 },
    { value: "90d" as Range, label: t.ranges.d90 },
    { value: "1y" as Range, label: t.ranges.y1 },
  ];

  const columns: DataTableColumn<AdminCalculatorUsageListItemDto>[] = [
    {
      key: "createdAt",
      header: t.calculators.colTime,
      render: (row) => <span className="adm-mono text-[11.5px]">{new Date(row.createdAt).toLocaleString()}</span>,
    },
    { key: "calculatorId", header: t.calculators.colCalculator, render: (row) => <span className="adm-mono">{row.calculatorId}</span> },
    { key: "userName", header: t.calculators.colUser, render: (row) => <span>{row.userName ?? "—"}</span> },
  ];

  return (
    <div>
      <AdminHeader
        title={t.calculators.title}
        subtitle={t.calculators.subtitle}
        actions={<DateRangePicker value={range} options={rangeOptions} onChange={setRange} />}
      />

      {overview.isLoading && (
        <div className="flex flex-col gap-4">
          <KpiGridSkeleton count={2} />
          <ChartSkeleton />
        </div>
      )}
      {overview.isError && !overview.isLoading && <AdminErrorState onRetry={() => overview.refetch()} />}

      {overview.data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <KpiCard index={0} label={t.calculators.totalUsage} value={fmtNumber(overview.data.totalUsage, lang)} deltaPct={null} />
            <KpiCard index={1} label={t.calculators.uniqueUsers} value={fmtNumber(overview.data.uniqueUsers, lang)} deltaPct={null} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdminChartCard title={t.calculators.usagePerDayTitle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview.data.usagePerDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={adminChartGrid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({ name: t.calculators.usagePerDayTitle, value: Number(p.value), color: adminChartColors[0] }))}
                      />
                    )}
                  />
                  <Line type="monotone" dataKey="value" stroke={adminChartColors[0]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard title={t.calculators.usagePerCalculatorTitle}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.data.usagePerCalculator} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={adminChartGrid} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis
                    dataKey="calculatorId"
                    type="category"
                    tick={{ fontSize: 10, fill: adminChartAxis }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({
                          name: t.calculators.usagePerCalculatorTitle,
                          value: Number(p.value),
                          color: adminChartColors[2],
                        }))}
                      />
                    )}
                  />
                  <Bar dataKey="count" fill={adminChartColors[2]} radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </AdminChartCard>
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-3 text-[14px] font-semibold" style={{ color: "var(--adm-text)" }}>
          {t.calculators.usageTableTitle}
        </div>
        <div className="mb-3">
          <FilterBar
            hasActiveFilters={!!calculatorId}
            onClear={() => {
              setCalculatorId("");
              setPage(1);
            }}
          >
            <AdminSelect
              value={calculatorId || "__all__"}
              onValueChange={(v) => {
                setCalculatorId(v === "__all__" ? "" : v);
                setPage(1);
              }}
            >
              <AdminSelectTrigger className="w-[170px]">
                <span className="mr-1" style={{ color: "var(--adm-text-3)" }}>
                  {t.calculators.filterCalculator}:
                </span>
                <AdminSelectValue />
              </AdminSelectTrigger>
              <AdminSelectContent>
                <AdminSelectItem value="__all__">{t.common.all}</AdminSelectItem>
                {CALCULATOR_IDS.map((id) => (
                  <AdminSelectItem key={id} value={id}>
                    {id}
                  </AdminSelectItem>
                ))}
              </AdminSelectContent>
            </AdminSelect>
          </FilterBar>
        </div>

        {usage.isError ? (
          <AdminErrorState onRetry={() => usage.refetch()} />
        ) : (
          <DataTable
            columns={columns}
            rows={usage.data?.items ?? []}
            getRowId={(row) => row.id}
            total={usage.data?.total ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            loading={usage.isLoading}
            onRowClick={(row) => setOpenRow(row)}
            emptyState={<AdminEmptyState message={t.calculators.empty} />}
          />
        )}
      </div>

      <DetailDrawer open={!!openRow} onOpenChange={(open) => !open && setOpenRow(null)} title={t.calculators.detailTitle} subtitle={openRow?.id}>
        {openRow && (
          <div className="flex flex-col gap-4 text-[12.5px]">
            <DrawerField label={t.calculators.colTime} value={new Date(openRow.createdAt).toLocaleString()} />
            <DrawerField label={t.calculators.colCalculator} value={openRow.calculatorId} />
            <DrawerField label={t.calculators.colUser} value={openRow.userName ?? "—"} />
            <div>
              <div className="text-[10.5px]" style={{ color: "var(--adm-text-3)" }}>
                {t.calculators.colInputs}
              </div>
              <pre
                className="adm-mono mt-1 overflow-x-auto rounded-[var(--adm-radius-sm)] border p-2 text-[11px]"
                style={{ borderColor: "var(--adm-border)", background: "var(--adm-bg-inset)" }}
              >
                {JSON.stringify(openRow.inputs, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-[10.5px]" style={{ color: "var(--adm-text-3)" }}>
                {t.calculators.colResult}
              </div>
              <pre
                className="adm-mono mt-1 overflow-x-auto rounded-[var(--adm-radius-sm)] border p-2 text-[11px]"
                style={{ borderColor: "var(--adm-border)", background: "var(--adm-bg-inset)" }}
              >
                {JSON.stringify(openRow.result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}

function DrawerField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px]" style={{ color: "var(--adm-text-3)" }}>
        {label}
      </div>
      <div className="mt-0.5 font-medium" style={{ color: "var(--adm-text)" }}>
        {value}
      </div>
    </div>
  );
}
