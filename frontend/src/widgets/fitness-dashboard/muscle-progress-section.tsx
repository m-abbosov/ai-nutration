import { useMemo, useState } from "react";

import type { MuscleCode, MuscleProgressDto } from "@nutriai/shared/api/types";
import { localeTags, useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";

import { MuscleBodyMap } from "@/entities/muscle-map/ui/MuscleBodyMap";
import { useMuscleDetail, useMuscleProgress } from "@/entities/workout/api/progress";

import { Skeleton } from "@/shared/ui/skeleton";

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] tracking-[.08em] text-tx3">{label}</div>
      <div className="mt-0.5 text-[13px] font-medium">{value}</div>
    </div>
  );
}

export function MuscleProgressSection() {
  const { t, lang } = useTranslation();
  const { data: progress, isLoading } = useMuscleProgress();
  const [view, setView] = useState<"front" | "back">("front");
  const [selected, setSelected] = useState<MuscleCode | null>(null);
  const { data: detail } = useMuscleDetail(selected ?? undefined);

  const muscleData = useMemo(() => {
    const map: Record<string, MuscleProgressDto> = {};
    progress?.forEach((m) => (map[m.muscle] = m));
    return map;
  }, [progress]);

  return (
    <section className="rounded-[20px] border border-line bg-surf px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-semibold tracking-[-.01em]">{t.fitness.muscleMapTitle}</h2>
          <p className="mt-0.5 text-[12px] text-tx3">{t.fitness.muscleMapSub}</p>
        </div>
        <div className="flex gap-0.5 rounded-full border border-line p-0.5">
          <button
            onClick={() => setView("front")}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors",
              view === "front" ? "bg-surf2 text-tx" : "text-tx3 hover:text-tx2",
            )}
          >
            {t.fitness.bodyFront}
          </button>
          <button
            onClick={() => setView("back")}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors",
              view === "back" ? "bg-surf2 text-tx" : "text-tx3 hover:text-tx2",
            )}
          >
            {t.fitness.bodyBack}
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="mx-auto mt-5 h-[380px] w-[190px] rounded-[16px]" />
      ) : (
        <div className="mt-5">
          <MuscleBodyMap view={view} muscleData={muscleData} onMuscleClick={setSelected} />
        </div>
      )}

      {selected && detail && (
        <div className="mt-4 rounded-[15px] border border-line bg-surf2 px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold">{t.fitness.muscles[selected]}</span>
            <button onClick={() => setSelected(null)} className="text-[11px] text-tx3 hover:text-tx">
              {t.fitness.close}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3">
            <DetailStat label={t.fitness.weeklySets} value={String(detail.weeklySets)} />
            <DetailStat label={t.fitness.weeklyVolume} value={`${Math.round(detail.weeklyVolume)}kg`} />
            <DetailStat label={t.fitness.detailSessions} value={String(detail.sessionsCount)} />
            <DetailStat
              label={t.fitness.detailVolumeChange}
              value={detail.volumeChangePct === null ? "—" : `${detail.volumeChangePct > 0 ? "+" : ""}${detail.volumeChangePct}%`}
            />
            <DetailStat
              label={t.fitness.detailStrengthChange}
              value={detail.strengthChangePct === null ? "—" : `${detail.strengthChangePct > 0 ? "+" : ""}${detail.strengthChangePct}%`}
            />
            <DetailStat
              label={t.fitness.tooltipLastTrained}
              value={detail.lastTrainedAt ? new Date(detail.lastTrainedAt).toLocaleDateString(localeTags[lang]) : t.fitness.tooltipNeverTrained}
            />
          </div>
        </div>
      )}
    </section>
  );
}
