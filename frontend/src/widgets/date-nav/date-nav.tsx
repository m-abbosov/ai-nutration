import { localeTags, useTranslation } from "@nutriai/shared/i18n";
import { formatDateLabel, todayLocalISO } from "@nutriai/shared/lib/format";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useSelectedDate } from "@/app/providers/selected-date-provider";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

export function DateNav({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useTranslation();
  const { date, isToday, setDate, shiftDay, goToday } = useSelectedDate();
  const label = formatDateLabel(date, localeTags[lang], t.app.today, t.app.yesterday);

  return (
    <div className="flex items-center gap-2">
      <button
        title={t.app.previousDay}
        onClick={() => shiftDay(-1)}
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
        onClick={() => shiftDay(1)}
        className="grid h-8 w-8 flex-none place-items-center rounded-[9px] border border-line text-tx3 transition-colors hover:bg-surf2 hover:text-tx disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
      {!compact && <span className="ml-1 flex-1 truncate font-mono text-[10px] tracking-[.1em] text-tx3">{label}</span>}
      {!compact && !isToday && (
        <Button variant="ghost" size="sm" onClick={goToday}>
          {t.app.backToToday}
        </Button>
      )}
    </div>
  );
}
