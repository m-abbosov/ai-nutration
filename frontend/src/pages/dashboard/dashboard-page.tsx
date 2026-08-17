import { useTranslation } from '@nutriai/shared/i18n'
import { useDashboard } from '@/shared/api/dashboard'
import { DashboardHero } from '@/widgets/dashboard-hero/dashboard-hero'
import { MacroOverview } from '@/widgets/macro-overview/macro-overview'
import { TodaysMeals } from '@/widgets/todays-meals/todays-meals'
import { AiInsightCard } from '@/widgets/ai-insight-card/ai-insight-card'
import { WeeklyChart } from '@/widgets/weekly-chart/weekly-chart'
import { Skeleton } from '@/shared/ui/skeleton'
import { ErrorState } from '@/shared/ui/state-blocks'

export function DashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useDashboard()

  return (
    <div className="animate-fu px-5 pb-[60px] pt-1.5 md:px-[34px]">
      {isLoading && <DashboardSkeleton />}
      {isError && <ErrorState message={t.app.dashboardError} onRetry={() => refetch()} />}
      {data && (
        <>
          <DashboardHero daily={data.daily} streakDays={data.streakDays} />
          <MacroOverview daily={data.daily} />
          <div className="mt-[34px] grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] items-start gap-6">
            <TodaysMeals meals={data.daily.meals} />
            <AiInsightCard daily={data.daily} insight={data.insight} />
          </div>
          <WeeklyChart data={data.weekly} />
        </>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-[300px] w-full rounded-[26px]" />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <Skeleton className="h-[120px] rounded-[17px]" />
        <Skeleton className="h-[120px] rounded-[17px]" />
        <Skeleton className="h-[120px] rounded-[17px]" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[260px] rounded-2xl" />
        <Skeleton className="h-[260px] rounded-2xl" />
      </div>
      <Skeleton className="h-[280px] rounded-2xl" />
    </div>
  )
}
