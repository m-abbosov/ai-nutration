import { useMemo } from "react";

import { useTranslation } from "@nutriai/shared/i18n";

import { useExercises } from "@/entities/workout/api/exercises";
import { usePersonalRecords } from "@/entities/workout/api/progress";

import { Skeleton } from "@/shared/ui/skeleton";

export function PersonalRecordsSection() {
  const { t, lang } = useTranslation();
  const { data: records, isLoading } = usePersonalRecords();
  const { data: exercises } = useExercises(lang);
  const nameBySlug = useMemo(() => new Map(exercises?.map((e) => [e.slug, e.name])), [exercises]);

  return (
    <section className="rounded-[20px] border border-line bg-surf px-5 py-5">
      <h2 className="text-[14px] font-semibold tracking-[-.01em]">{t.fitness.prTitle}</h2>

      {isLoading && <Skeleton className="mt-3.5 h-[160px] w-full" />}
      {!isLoading && (!records || records.length === 0) && <p className="mt-3.5 text-[12.5px] text-tx3">{t.fitness.prEmpty}</p>}

      {records && records.length > 0 && (
        <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {records.slice(0, 8).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 rounded-[12px] bg-surf2 px-3.5 py-2.5 text-[12px]">
              <div className="min-w-0">
                <div className="truncate font-medium">{nameBySlug.get(r.exerciseSlug) ?? r.exerciseSlug}</div>
                <div className="text-tx3">{t.fitness.prTypeLabel[r.recordType]}</div>
              </div>
              <div className="flex-none font-mono font-medium text-acc">
                {r.value}
                {r.recordType !== "MAX_REPS" ? "kg" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
