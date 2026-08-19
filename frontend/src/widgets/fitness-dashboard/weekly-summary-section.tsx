import { useMemo } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { fmtNumber } from "@nutriai/shared/lib/format";

import { useWorkouts } from "@/entities/workout/api/workouts";

import { Skeleton } from "@/shared/ui/skeleton";

export function WeeklySummarySection() {
  const { t, lang } = useTranslation();
  const { data: workouts, isLoading } = useWorkouts(7);

  const stats = useMemo(() => {
    if (!workouts) return { count: 0, volume: 0, sets: 0 };
    return workouts.reduce(
      (acc, w) => ({
        count: acc.count + 1,
        volume: acc.volume + w.totalVolume,
        sets: acc.sets + w.exercises.reduce((s, e) => s + e.sets.length, 0),
      }),
      { count: 0, volume: 0, sets: 0 },
    );
  }, [workouts]);

  return (
    <section className="rounded-[17px] border border-line bg-surf p-4">
      <h2 className="text-[13px] font-semibold tracking-[-.01em]">{t.fitness.weeklyTitle}</h2>
      <p className="mt-0.5 text-[11.5px] text-tx3">{t.fitness.weeklySub(stats.count)}</p>

      {isLoading ? (
        <Skeleton className="mt-3.5 h-[64px] w-full" />
      ) : (
        <div className="mt-3.5 grid grid-cols-3 gap-2.5">
          <StatBlock label={t.fitness.weeklyWorkouts} value={String(stats.count)} />
          <StatBlock label={t.fitness.weeklyVolume} value={`${fmtNumber(stats.volume, lang)}kg`} />
          <StatBlock label={t.fitness.weeklySets} value={String(stats.sets)} />
        </div>
      )}
    </section>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-surf2 px-2.5 py-2.5">
      <div className="truncate font-mono text-[8.5px] tracking-[.08em] text-tx3">{label}</div>
      <div className="mt-1 truncate text-[14px] font-medium">{value}</div>
    </div>
  );
}
