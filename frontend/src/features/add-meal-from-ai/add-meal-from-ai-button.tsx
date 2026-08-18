import type { NutritionAnalysisDto } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";

import { useAddMeal } from "@/shared/api/meals";

export function AddMealFromAiButton({ analysis, added, onAdded }: { analysis: NutritionAnalysisDto; added: boolean; onAdded: () => void }) {
  const { t } = useTranslation();
  const addMeal = useAddMeal();

  const handleClick = () => {
    if (added || addMeal.isPending) return;
    addMeal.mutate(
      {
        mealType: analysis.mealType,
        name: analysis.mealName,
        source: "AI",
        items: analysis.items,
      },
      { onSuccess: onAdded },
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={added || addMeal.isPending}
      className={cn(
        "w-full rounded-[11px] px-3 py-2.5 text-[12.5px] font-semibold transition-[filter,transform] hover:brightness-[1.08] active:scale-[0.98] disabled:cursor-default disabled:hover:brightness-100",
        added ? "bg-accT text-acc" : "bg-acc text-[#04120e]",
      )}
    >
      {added ? t.addedMeal : addMeal.isPending ? t.app.loading : t.addMealToToday}
    </button>
  );
}
