import { useTranslation } from "@nutriai/shared/i18n";

import { useDailyNutrition } from "@/shared/api/nutrition";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/state-blocks";

import { RequestRecommendationButton } from "@/features/request-recommendation/request-recommendation-button";

import { MealTimeline } from "@/widgets/meal-timeline/meal-timeline";
import { AddMealDropdown } from "@/widgets/meals-summary/add-meal-dropdown";
import { MealsSummary } from "@/widgets/meals-summary/meals-summary";

export function MealsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useDailyNutrition();

  return (
    <div className="animate-fu px-5 pb-[70px] pt-[22px] md:px-[34px]">
      <div className="flex flex-wrap items-end gap-[18px]">
        <div className="min-w-[220px] flex-1">
          <h2 className="m-0 text-[22px] font-medium tracking-[-.02em] md:text-[24px]">{t.mpTitle}</h2>
          <p className="m-0 mt-[5px] text-[13.5px] text-tx2">{t.mpSub}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <RequestRecommendationButton />
          <AddMealDropdown />
        </div>
      </div>

      {isLoading && (
        <div className="mt-6 flex flex-col gap-4">
          <Skeleton className="h-[140px] rounded-[20px]" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      )}
      {isError && (
        <div className="mt-6">
          <ErrorState message={t.app.error} onRetry={() => refetch()} />
        </div>
      )}
      {data && (
        <>
          <MealsSummary daily={data} />
          <MealTimeline meals={data.meals} />
        </>
      )}
    </div>
  );
}
