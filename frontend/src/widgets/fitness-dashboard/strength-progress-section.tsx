import { useMemo, useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { estimateOneRepMax } from "@nutriai/shared/lib/estimate-1rm";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useExercises } from "@/entities/workout/api/exercises";
import { useWorkouts } from "@/entities/workout/api/workouts";

import { Skeleton } from "@/shared/ui/skeleton";

interface StrengthPoint {
  date: string;
  est1rm: number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: StrengthPoint }[];
  label?: string;
}

function StrengthTooltip({ active, payload, unitLabel }: ChartTooltipProps & { unitLabel: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="min-w-[120px] rounded-[13px] border border-line2 bg-surf2 px-3.5 py-2.5 shadow-card">
      <div className="font-mono text-[9.5px] tracking-[.1em] text-tx3">{point.date}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-[16px] font-medium tracking-[-.02em]">{point.est1rm}</span>
        <span className="text-[10.5px] text-tx3">{unitLabel}</span>
      </div>
    </div>
  );
}

export function StrengthProgressSection() {
  const { t, lang } = useTranslation();
  const { data: workouts, isLoading } = useWorkouts(90);
  const { data: exercises } = useExercises(lang);
  const nameBySlug = useMemo(() => new Map(exercises?.map((e) => [e.slug, e.name])), [exercises]);

  const seriesByExercise = useMemo(() => {
    const map = new Map<string, StrengthPoint[]>();
    if (!workouts) return map;
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    for (const w of sorted) {
      for (const ex of w.exercises) {
        let best = 0;
        for (const s of ex.sets) {
          if (s.weight !== null && s.reps !== null) {
            const kg = s.weightUnit === "LB" ? s.weight * 0.453592 : s.weight;
            best = Math.max(best, estimateOneRepMax(kg, s.reps));
          }
        }
        if (best === 0) continue;
        const arr = map.get(ex.exerciseSlug) ?? [];
        arr.push({ date: w.date, est1rm: best });
        map.set(ex.exerciseSlug, arr);
      }
    }
    return map;
  }, [workouts]);

  const exerciseSlugs = useMemo(() => [...seriesByExercise.keys()], [seriesByExercise]);
  const [selected, setSelected] = useState<string | null>(null);
  const activeSlug = selected && seriesByExercise.has(selected) ? selected : (exerciseSlugs[0] ?? null);
  const data = activeSlug ? (seriesByExercise.get(activeSlug) ?? []) : [];

  return (
    <section className="rounded-[20px] border border-line bg-surf px-5 pb-3.5 pt-[22px]">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold tracking-[-.01em]">{t.fitness.strengthTitle}</h2>
        {exerciseSlugs.length > 0 && (
          <select
            value={activeSlug ?? ""}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-[9px] border border-line bg-surf2 px-2.5 py-1.5 text-[11.5px]"
          >
            {exerciseSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {nameBySlug.get(slug) ?? slug}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading && <Skeleton className="h-[220px] w-full" />}
      {!isLoading && data.length === 0 && <p className="text-[12.5px] text-tx3">{t.fitness.strengthEmpty}</p>}
      {!isLoading && data.length > 0 && (
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "var(--tx3)", fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fill: "var(--tx3)", fontSize: 9.5, fontFamily: "IBM Plex Mono, monospace" }}
              />
              <Tooltip
                cursor={{ stroke: "var(--line2)" }}
                content={(props: object) => <StrengthTooltip {...(props as ChartTooltipProps)} unitLabel={t.fitness.strengthEst1rm} />}
              />
              <Line type="monotone" dataKey="est1rm" stroke="var(--acc)" strokeWidth={2} dot={{ r: 3, fill: "var(--acc)" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
