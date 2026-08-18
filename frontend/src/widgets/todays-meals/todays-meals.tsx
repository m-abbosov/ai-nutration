import { useTranslation } from "@nutriai/shared/i18n";
import { Link } from "react-router-dom";

import { useSelectedDate } from "@/app/providers/selected-date-provider";

import { useMeals } from "@/shared/api/meals";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/state-blocks";

import { DateNav } from "@/widgets/date-nav/date-nav";
import { MealCard } from "@/widgets/meal-timeline/meal-card";

export function TodaysMeals() {
  const { t } = useTranslation();
  const { date } = useSelectedDate();
  const { data: meals, isLoading, isError, refetch } = useMeals(date);

  const sorted = meals ? [...meals].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];
  const dayTotal = sorted.reduce((sum, m) => sum + m.calories, 0);

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="m-0 text-[13px] font-semibold tracking-[.02em]">{t.mealsTitle}</h2>
        <Link to="/meals" className="font-mono text-[10px] tracking-[.12em] text-tx3 transition-colors hover:text-acc">
          {t.viewAll}
        </Link>
      </div>

      <div className="mb-4">
        <DateNav />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {meals &&
        (sorted.length === 0 ? (
          <EmptyMealsCard />
        ) : (
          <div>
            {sorted.map((m) => (
              <MealCard key={m.id} meal={m} dayTotal={dayTotal} />
            ))}
          </div>
        ))}
    </section>
  );
}

function EmptyMealsCard() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-line2 px-[15px] py-3.5">
      <span className="min-w-[150px] flex-1 text-[13px] text-tx3">{t.app.mealsEmpty}</span>
      <Button asChild size="sm">
        <Link to="/chat">{t.askAI}</Link>
      </Button>
    </div>
  );
}
