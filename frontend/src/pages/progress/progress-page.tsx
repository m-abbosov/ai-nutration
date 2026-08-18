import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";

import { useAuth } from "@/app/providers/auth-provider";

import { useDailyNutrition, useWeeklyNutrition } from "@/shared/api/nutrition";
import { useMountedTransition } from "@/shared/lib/use-mounted-transition";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/state-blocks";

import { MacroConsistencyCard } from "@/widgets/macro-consistency-card/macro-consistency-card";
import { ProgressTrendChart } from "@/widgets/progress-trend-chart/progress-trend-chart";
import { WeightCard } from "@/widgets/weight-card/weight-card";

import { computeWeeklyStats } from "@/entities/meal/lib/weekly-stats";

export function ProgressPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const mounted = useMountedTransition();
  const weekly = useWeeklyNutrition(range);
  const daily = useDailyNutrition();

  const stats = weekly.data ? computeWeeklyStats(weekly.data) : null;

  return (
    <div className="animate-fu px-5 pb-[70px] pt-[22px] md:px-[34px]">
      <div className="flex flex-wrap items-end gap-[18px]">
        <div className="min-w-[220px] flex-1">
          <h2 className="m-0 text-[22px] font-medium tracking-[-.02em] md:text-[24px]">{t.pgTitle}</h2>
          <p className="m-0 mt-[5px] text-[13.5px] text-tx2">{t.pgSub}</p>
        </div>
      </div>

      {weekly.isLoading && <Skeleton className="mt-5 h-[280px] rounded-[20px]" />}
      {weekly.isError && (
        <div className="mt-5">
          <ErrorState message={t.app.error} onRetry={() => weekly.refetch()} />
        </div>
      )}
      {weekly.data && (
        <div className="mt-[22px]">
          <ProgressTrendChart data={weekly.data} range={range} onRangeChange={setRange} />
        </div>
      )}

      {stats && (
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
          <StatCard label={t.pgAvgCal} value={String(stats.avgConsumed)} />
          <div className="flex items-center gap-3.5 rounded-[17px] border border-line bg-surf p-4">
            <div className="min-w-0 flex-1">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9.5px] tracking-[.14em] text-tx3">{t.pgAdher}</div>
              <div className="mt-[11px] text-[25px] font-medium tracking-[-.028em] tabular-nums">{stats.adherencePct}%</div>
            </div>
            <svg width="46" height="46" viewBox="0 0 46 46" className="flex-none">
              <circle cx="23" cy="23" r="18" fill="none" stroke="var(--line)" strokeWidth="5" />
              <circle
                cx="23"
                cy="23"
                r="18"
                fill="none"
                stroke="var(--acc)"
                strokeWidth="5"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={mounted ? `${stats.adherencePct}, 100` : "0, 100"}
                transform="rotate(-90 23 23)"
                style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.16,.84,.24,1)" }}
              />
            </svg>
          </div>
          <div className="rounded-[17px] border border-line bg-surf p-4">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9.5px] tracking-[.14em] text-tx3">{t.pgDays}</div>
            <div className="mt-[11px] text-[25px] font-medium tracking-[-.028em] tabular-nums">
              {stats.successfulDays} <span className="text-[14px] text-tx3">/ {stats.totalDays}</span>
            </div>
            <div className="mt-2.5 flex gap-1.5">
              {stats.dayDots.map((ok, i) => (
                <span key={i} className={`h-[5px] flex-1 rounded-full ${ok ? "bg-acc" : "bg-line2"}`} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
        {user && <WeightCard user={user} />}
        {daily.data && <MacroConsistencyCard daily={daily.data} />}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[17px] border border-line bg-surf p-4">
      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9.5px] tracking-[.14em] text-tx3">{label}</div>
      <div className="mt-[11px] text-[25px] font-medium tracking-[-.028em] tabular-nums">{value}</div>
    </div>
  );
}
