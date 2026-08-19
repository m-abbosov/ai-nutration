import { useTranslation } from "@nutriai/shared/i18n";

import { useWorkouts } from "@/entities/workout/api/workouts";

import { Skeleton } from "@/shared/ui/skeleton";

export function RecentWorkoutsSection() {
  const { t } = useTranslation();
  const { data: workouts, isLoading } = useWorkouts(30);

  return (
    <section className="rounded-[20px] border border-line bg-surf px-5 py-5">
      <h2 className="text-[14px] font-semibold tracking-[-.01em]">{t.fitness.recentTitle}</h2>

      {isLoading && <Skeleton className="mt-3.5 h-[160px] w-full" />}
      {!isLoading && (!workouts || workouts.length === 0) && <p className="mt-3.5 text-[12.5px] text-tx3">{t.fitness.recentEmpty}</p>}

      {workouts && workouts.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-2">
          {workouts.slice(0, 8).map((w) => {
            const setCount = w.exercises.reduce((s, e) => s + e.sets.length, 0);
            return (
              <div key={w.id} className="flex items-center justify-between gap-3 rounded-[12px] bg-surf2 px-3.5 py-2.5 text-[12px]">
                <div className="min-w-0">
                  <div className="truncate font-medium">{w.date}</div>
                  <div className="truncate text-tx3">
                    {t.fitness.recentExercises(w.exercises.length)} · {t.fitness.setsCount(setCount)}
                  </div>
                </div>
                <div className="flex-none font-mono text-tx3">{Math.round(w.totalVolume)}kg</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
