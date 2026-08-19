import { useMemo, useRef, useState } from "react";

import type { MuscleCode, MuscleProgressDto } from "@nutriai/shared/api/types";
import { localeTags, useTranslation } from "@nutriai/shared/i18n";
import { AnimatePresence, motion } from "framer-motion";

import { muscleScoreColorVar } from "../lib/muscleColors";
import { BackBody } from "./BackBody";
import { FrontBody } from "./FrontBody";

interface TooltipState {
  muscle: MuscleCode;
  x: number;
  y: number;
}

export function MuscleBodyMap({
  view,
  muscleData,
  onMuscleClick,
}: {
  view: "front" | "back";
  muscleData: Record<string, MuscleProgressDto>;
  onMuscleClick?: (muscle: MuscleCode) => void;
}) {
  const { t, lang } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const getColor = (muscle: MuscleCode) => muscleScoreColorVar(muscleData[muscle]?.progressScore ?? 0);
  const getLabel = (muscle: MuscleCode) => t.fitness.muscleAriaLabel(t.fitness.muscles[muscle], muscleData[muscle]?.progressScore ?? 0);

  const handleEnter = (muscle: MuscleCode, e: React.MouseEvent | React.FocusEvent) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    const target = e.currentTarget as SVGElement;
    const targetRect = target.getBoundingClientRect();
    setTooltip({
      muscle,
      x: targetRect.left + targetRect.width / 2 - containerRect.left,
      y: targetRect.top - containerRect.top,
    });
  };
  const handleLeave = () => setTooltip(null);
  const handleClick = (muscle: MuscleCode) => onMuscleClick?.(muscle);

  const tooltipData = tooltip ? muscleData[tooltip.muscle] : undefined;
  const lastTrainedLabel = useMemo(() => {
    if (!tooltipData) return "";
    if (!tooltipData.lastTrainedAt) return t.fitness.tooltipNeverTrained;
    return new Date(tooltipData.lastTrainedAt).toLocaleDateString(localeTags[lang]);
  }, [tooltipData, t, lang]);

  return (
    <div ref={containerRef} className="relative mx-auto aspect-[1/2] w-full max-w-[300px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, x: view === "front" ? -12 : 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: view === "front" ? 12 : -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="h-full w-full"
        >
          {view === "front" ? (
            <FrontBody getColor={getColor} getLabel={getLabel} onMuscleEnter={handleEnter} onMuscleLeave={handleLeave} onMuscleClick={handleClick} />
          ) : (
            <BackBody getColor={getColor} getLabel={getLabel} onMuscleEnter={handleEnter} onMuscleLeave={handleLeave} onMuscleClick={handleClick} />
          )}
        </motion.div>
      </AnimatePresence>

      {tooltip && tooltipData && (
        <div
          className="pointer-events-none absolute z-10 min-w-[150px] -translate-x-1/2 -translate-y-full rounded-[13px] border border-line2 bg-surf2 px-3.5 py-2.5 text-[11.5px] shadow-card"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <div className="font-semibold text-tx">{t.fitness.muscles[tooltip.muscle]}</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-[15px] font-medium tracking-[-.02em]" style={{ color: muscleScoreColorVar(tooltipData.progressScore) }}>
              {tooltipData.progressScore}
            </span>
            <span className="text-[10.5px] text-tx3">/ 100</span>
          </div>
          <div className="mt-1.5 flex flex-col gap-0.5 border-t border-line pt-1.5 text-tx3">
            <span>{t.fitness.tooltipSets(tooltipData.weeklySets)}</span>
            <span>
              {t.fitness.tooltipVolume}: {Math.round(tooltipData.weeklyVolume)}
              {t.fitness.weightUnitKg}
            </span>
            <span>{t.fitness.tooltipSessions(tooltipData.sessionsCount)}</span>
            <span>
              {t.fitness.tooltipLastTrained}: {lastTrainedLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
