import { useTranslation } from "@nutriai/shared/i18n";

import { LogWorkoutCta } from "@/features/log-workout-cta/log-workout-cta";

import { AiCoachInsightSection } from "@/widgets/fitness-dashboard/ai-coach-insight-section";
import { MuscleBalanceSection } from "@/widgets/fitness-dashboard/muscle-balance-section";
import { MuscleProgressSection } from "@/widgets/fitness-dashboard/muscle-progress-section";
import { PersonalRecordsSection } from "@/widgets/fitness-dashboard/personal-records-section";
import { RecentWorkoutsSection } from "@/widgets/fitness-dashboard/recent-workouts-section";
import { StrengthProgressSection } from "@/widgets/fitness-dashboard/strength-progress-section";
import { TodayWorkoutSection } from "@/widgets/fitness-dashboard/today-workout-section";
import { WeeklySummarySection } from "@/widgets/fitness-dashboard/weekly-summary-section";

export function FitnessPage() {
  const { t } = useTranslation();

  return (
    <div className="animate-fu px-5 pb-[60px] pt-1.5 md:px-[34px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif-hero text-[26px] font-normal leading-[1.15] tracking-[-.01em] md:text-[30px]">{t.fitness.pageTitle}</h1>
          <p className="mt-1.5 text-[13px] text-tx2">{t.fitness.pageSub}</p>
        </div>
        <LogWorkoutCta />
      </div>

      <div className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-start gap-6">
        <TodayWorkoutSection />
        <WeeklySummarySection />
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <MuscleProgressSection />
        <div className="flex flex-col gap-6">
          <StrengthProgressSection />
          <MuscleBalanceSection />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-start gap-6">
        <RecentWorkoutsSection />
        <PersonalRecordsSection />
      </div>

      <div className="mt-6">
        <AiCoachInsightSection />
      </div>
    </div>
  );
}
