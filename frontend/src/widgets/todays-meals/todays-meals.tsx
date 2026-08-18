import { useState } from "react";

import { localeTags, useTranslation } from "@nutriai/shared/i18n";
import { formatDateLabel, shiftDateISO, todayLocalISO } from "@nutriai/shared/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { useMeals } from "@/shared/api/meals";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { ErrorState } from "@/shared/ui/state-blocks";

import { MealCard } from "@/widgets/meal-timeline/meal-card";

export function TodaysMeals() {
  const { t, lang } = useTranslation();
  const [date, setDate] = useState(todayLocalISO());
  const { data: meals, isLoading, isError, refetch } = useMeals(date);

  const isToday = date === todayLocalISO();
  const label = formatDateLabel(date, localeTags[lang], t.app.today, t.app.yesterday);
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

      <div className="mb-4 flex items-center gap-2">
        <button
          title={t.app.previousDay}
          onClick={() => setDate((d) => shiftDateISO(d, -1))}
          className="grid h-8 w-8 flex-none place-items-center rounded-[9px] border border-line text-tx3 transition-colors hover:bg-surf2 hover:text-tx"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <Input
          type="date"
          value={date}
          max={todayLocalISO()}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className="w-auto flex-none px-2.5 py-1.5 text-[12px]"
        />
        <button
          title={t.app.nextDay}
          disabled={isToday}
          onClick={() => setDate((d) => shiftDateISO(d, 1))}
          className="grid h-8 w-8 flex-none place-items-center rounded-[9px] border border-line text-tx3 transition-colors hover:bg-surf2 hover:text-tx disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <span className="ml-1 flex-1 truncate font-mono text-[10px] tracking-[.1em] text-tx3">{label}</span>
        {!isToday && (
          <Button variant="ghost" size="sm" onClick={() => setDate(todayLocalISO())}>
            {t.app.backToToday}
          </Button>
        )}
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
