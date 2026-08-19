import { useMemo } from "react";

import { useTranslation } from "@nutriai/shared/i18n";

import { useMuscleBalance } from "@/entities/workout/api/progress";

import { Skeleton } from "@/shared/ui/skeleton";

const IMBALANCE_THRESHOLD_PCT = 30;

export function MuscleBalanceSection() {
  const { t } = useTranslation();
  const { data: balance, isLoading } = useMuscleBalance();

  const groups = useMemo(
    () =>
      balance
        ? [
            { key: "push", label: t.fitness.balancePush, ...balance.push, color: "var(--pro)" },
            { key: "pull", label: t.fitness.balancePull, ...balance.pull, color: "var(--acc)" },
            { key: "legs", label: t.fitness.balanceLegs, ...balance.legs, color: "var(--carb)" },
            { key: "core", label: t.fitness.balanceCore, ...balance.core, color: "var(--fat)" },
          ]
        : [],
    [balance, t],
  );

  const hasVolume = groups.some((g) => g.volume > 0);

  const insight = useMemo(() => {
    if (!hasVolume) return null;
    const sorted = [...groups].sort((a, b) => b.percentage - a.percentage);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    if (highest.percentage - lowest.percentage >= IMBALANCE_THRESHOLD_PCT) {
      return t.fitness.balanceInsightImbalanced(highest.label, lowest.label);
    }
    return t.fitness.balanceInsightBalanced;
  }, [groups, hasVolume, t]);

  return (
    <section className="rounded-[20px] border border-line bg-surf px-5 py-5">
      <h2 className="text-[14px] font-semibold tracking-[-.01em]">{t.fitness.balanceTitle}</h2>

      {isLoading && <Skeleton className="mt-3.5 h-[110px] w-full" />}
      {!isLoading && !hasVolume && <p className="mt-3.5 text-[12.5px] text-tx3">{t.fitness.balanceEmpty}</p>}

      {!isLoading && hasVolume && (
        <>
          <div className="mt-3.5 flex h-2.5 w-full overflow-hidden rounded-full bg-surf2">
            {groups.map((g) => (
              <div key={g.key} style={{ width: `${g.percentage}%`, background: g.color }} />
            ))}
          </div>
          <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {groups.map((g) => (
              <div key={g.key}>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 flex-none rounded-full" style={{ background: g.color }} />
                  <span className="truncate text-[11px] text-tx2">{g.label}</span>
                </div>
                <div className="mt-0.5 text-[14px] font-medium">{g.percentage}%</div>
              </div>
            ))}
          </div>
          {insight && <p className="mt-3.5 border-t border-line pt-3 text-[12.5px] text-tx2">{insight}</p>}
        </>
      )}
    </section>
  );
}
