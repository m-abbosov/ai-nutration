import type { MealDto } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";

import { EmptyState } from "@/shared/ui/state-blocks";

import { MealCard } from "@/widgets/meal-timeline/meal-card";

export function MealTimeline({ meals }: { meals: MealDto[] }) {
  const { t } = useTranslation();
  const sorted = [...meals].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const dayTotal = meals.reduce((sum, m) => sum + m.calories, 0);

  if (sorted.length === 0) {
    return (
      <div className="mt-[30px]">
        <EmptyState message={t.app.mealsEmpty} />
      </div>
    );
  }

  return (
    <div className="mt-[30px]">
      {sorted.map((meal) => (
        <MealCard key={meal.id} meal={meal} dayTotal={dayTotal} />
      ))}
    </div>
  );
}
