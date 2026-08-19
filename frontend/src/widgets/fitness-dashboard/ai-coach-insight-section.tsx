import { useMemo } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { todayLocalISO } from "@nutriai/shared/lib/format";

import { useDashboard } from "@/shared/api/dashboard";

import { useWorkouts } from "@/entities/workout/api/workouts";

const CONSISTENT_TRAINING_DAYS_THRESHOLD = 4;

/** A deterministic, rule-based insight computed from real nutrition + workout
 * data already fetched for the dashboard — never a fabricated number, and
 * not a separate live AI call (mirrors how muscle-balance's insight works). */
export function AiCoachInsightSection() {
  const { t } = useTranslation();
  const { data: dashboard } = useDashboard();
  const { data: workouts } = useWorkouts(7);

  const insight = useMemo(() => {
    if (!workouts) return null;
    const todayIso = todayLocalISO();
    const trainedToday = workouts.some((w) => w.date === todayIso);

    if (trainedToday && dashboard) {
      const remainingKcal = Math.round(dashboard.daily.remaining);
      const remainingProtein = Math.round(dashboard.daily.protein.target - dashboard.daily.protein.consumed);
      return t.fitness.coachInsightWorkoutDone(remainingKcal, remainingProtein);
    }

    const trainedDays = new Set(workouts.map((w) => w.date)).size;
    if (trainedDays >= CONSISTENT_TRAINING_DAYS_THRESHOLD) {
      return t.fitness.coachInsightConsistent(trainedDays);
    }

    return t.fitness.coachInsightNoWorkoutToday;
  }, [workouts, dashboard, t]);

  if (!insight) return null;

  return (
    <section
      className="relative overflow-hidden rounded-[22px] p-px"
      style={{ background: "linear-gradient(150deg, var(--accG), var(--line) 42%, var(--line))" }}
    >
      <div className="relative overflow-hidden rounded-[21px] bg-surf px-[22px] py-5">
        <div
          className="pointer-events-none absolute -right-0 -top-[30%] h-[220px] w-[220px] animate-drift rounded-full opacity-70 blur-[30px]"
          style={{ background: "radial-gradient(circle, var(--accG), transparent 65%)" }}
        />
        <div className="relative text-[13.5px] font-semibold tracking-[-.01em]">{t.fitness.coachTitle}</div>
        <p className="relative mt-2.5 text-pretty text-[14px] leading-[1.5] text-tx2">{insight}</p>
      </div>
    </section>
  );
}
