import { useMemo, useState } from "react";

import type { CreateWorkoutExerciseInput, WorkoutAnalysisDto } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";

import { useExercises } from "@/entities/workout/api/exercises";
import { useCreateWorkout } from "@/entities/workout/api/workouts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface RowState {
  exerciseId: string | null;
  showPicker: boolean;
}

export function WorkoutAnalysisCard({
  data,
  saved,
  onSaved,
}: {
  data: WorkoutAnalysisDto;
  saved: boolean;
  onSaved: () => void;
}) {
  const { t, lang } = useTranslation();
  const { data: catalog } = useExercises(lang);
  const createWorkout = useCreateWorkout();

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    catalog?.forEach((e) => map.set(e.id, e.name));
    return map;
  }, [catalog]);

  const [rows, setRows] = useState<RowState[]>(() =>
    data.exercises.map((ex) => ({ exerciseId: ex.matchedExerciseId, showPicker: false })),
  );
  const [newPrCount, setNewPrCount] = useState(0);

  const allResolved = rows.every((r) => r.exerciseId !== null);

  const setRowExercise = (index: number, exerciseId: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { exerciseId, showPicker: false } : r)));
  };

  const togglePicker = (index: number) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, showPicker: !r.showPicker } : r)));
  };

  const handleSave = () => {
    if (saved || createWorkout.isPending || !allResolved) return;
    const exercises: CreateWorkoutExerciseInput[] = data.exercises.map((ex, i) => ({
      exerciseId: rows[i].exerciseId!,
      sets: ex.sets.map((s) => ({
        setNumber: s.setNumber,
        weight: s.weight,
        weightUnit: s.weightUnit,
        reps: s.reps,
        durationSec: s.durationSec,
      })),
    }));
    createWorkout.mutate(
      { source: "AI", notes: data.notes ?? undefined, exercises },
      {
        onSuccess: (workout) => {
          setNewPrCount(workout.newPersonalRecords.length);
          onSaved();
        },
      },
    );
  };

  return (
    <div className="mt-3.5 max-w-[420px] overflow-hidden rounded-[18px] border border-line bg-surf shadow-card">
      <div className="border-b border-line px-4 pb-3.5 pt-[15px]">
        <div className="font-mono text-[10.5px] tracking-[.1em] text-tx3">{t.fitness.workoutAnalysisTitle}</div>
      </div>
      <div className="flex flex-col gap-3.5 px-4 py-3.5">
        {data.exercises.map((ex, i) => {
          const row = rows[i];
          const resolvedName = row.exerciseId ? (nameById.get(row.exerciseId) ?? ex.rawText) : ex.rawText;
          const unmatched = row.exerciseId === null && ex.ambiguousCandidates.length === 0;

          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-medium">{resolvedName}</span>
                <span className="flex-none text-[11px] text-tx3">{t.fitness.setsCount(ex.sets.length)}</span>
              </div>
              <div className="truncate text-[11.5px] text-tx3">
                {ex.sets
                  .map((s) => {
                    const weightPart = s.weight != null ? `${s.weight}${s.weightUnit === "KG" ? t.fitness.weightUnitKg : t.fitness.weightUnitLb}` : "";
                    const repsPart = s.reps != null ? `×${s.reps}` : "";
                    return `${weightPart}${repsPart}`;
                  })
                  .join(", ")}
              </div>

              {!saved && ex.ambiguousCandidates.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11.5px] text-tx2">
                    {t.fitness.didYouMean(nameById.get(ex.ambiguousCandidates[0].exerciseId) ?? ex.ambiguousCandidates[0].slug)}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ex.ambiguousCandidates.map((c) => (
                      <button
                        key={c.exerciseId}
                        onClick={() => setRowExercise(i, c.exerciseId)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          row.exerciseId === c.exerciseId ? "border-acc bg-accT text-acc" : "border-line text-tx2 hover:bg-surf2",
                        )}
                      >
                        {nameById.get(c.exerciseId) ?? c.slug}
                      </button>
                    ))}
                    <button
                      onClick={() => togglePicker(i)}
                      className="rounded-full border border-line px-2.5 py-1 text-[11px] text-tx3 hover:bg-surf2"
                    >
                      {t.fitness.chooseAnother}
                    </button>
                  </div>
                </div>
              )}

              {!saved && (row.showPicker || unmatched) && (
                <Select value={row.exerciseId ?? undefined} onValueChange={(v) => setRowExercise(i, v)}>
                  <SelectTrigger className="h-8 py-1.5 text-[11.5px]">
                    <SelectValue placeholder={t.fitness.selectExercise} />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          );
        })}
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={handleSave}
          disabled={saved || createWorkout.isPending || !allResolved}
          className={cn(
            "w-full rounded-[11px] px-3 py-2.5 text-[12.5px] font-semibold transition-[filter,transform] hover:brightness-[1.08] active:scale-[0.98] disabled:cursor-default disabled:opacity-60 disabled:hover:brightness-100",
            saved ? "bg-accT text-acc" : "bg-acc text-[#04120e]",
          )}
        >
          {saved ? t.fitness.workoutSaved : createWorkout.isPending ? t.app.loading : t.fitness.saveWorkout}
        </button>
        {createWorkout.isError && !saved && <p className="mt-2 text-center text-[11.5px] text-fat">{t.fitness.workoutSaveFailed}</p>}
        <AnimatePresence>
          {saved && newPrCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="mt-2.5 flex items-center justify-center gap-2 rounded-[11px] bg-m5T px-3 py-2 text-[12px] font-semibold"
              style={{ color: "var(--m5)" }}
            >
              <Trophy className="h-3.5 w-3.5" />
              {t.fitness.prNewBadge}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
