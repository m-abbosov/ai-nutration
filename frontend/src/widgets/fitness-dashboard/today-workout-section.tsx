import { useMemo } from "react";

import { useTranslation } from "@nutriai/shared/i18n";

import { LogWorkoutCta } from "@/features/log-workout-cta/log-workout-cta";

import { useExercises } from "@/entities/workout/api/exercises";
import { useWorkouts } from "@/entities/workout/api/workouts";

import { Skeleton } from "@/shared/ui/skeleton";

export function TodayWorkoutSection() {
  const { t, lang } = useTranslation();
  const { data: workouts, isLoading } = useWorkouts(1);
  const { data: exercises } = useExercises(lang);
  const nameBySlug = useMemo(() => new Map(exercises?.map((e) => [e.slug, e.name])), [exercises]);

  const hasWorkout = !!workouts && workouts.length > 0;

  return (
    <section className="rounded-[20px] border border-line bg-surf px-5 py-5">
      <h2 className="text-[14px] font-semibold tracking-[-.01em]">{t.fitness.todayTitle}</h2>

      {isLoading && <Skeleton className="mt-3.5 h-16 w-full" />}

      {!isLoading && !hasWorkout && (
        <div className="mt-3.5">
          <p className="text-[12.5px] text-tx3">{t.fitness.todayEmpty}</p>
          <LogWorkoutCta className="mt-3.5" />
        </div>
      )}

      {hasWorkout && (
        <div className="mt-3.5 flex flex-col gap-2">
          {workouts.map((w) => (
            <div key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-surf2 px-3.5 py-2.5 text-[12.5px]">
              <span className="min-w-0 flex-1 truncate text-tx2">
                {w.exercises.map((e) => nameBySlug.get(e.exerciseSlug) ?? e.exerciseSlug).join(", ")}
              </span>
              <span className="flex-none font-mono text-tx3">{Math.round(w.totalVolume)}kg</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
