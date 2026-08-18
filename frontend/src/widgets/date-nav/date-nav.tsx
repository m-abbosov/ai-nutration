import { useState } from "react";

import { localeTags, useTranslation } from "@nutriai/shared/i18n";
import { formatDateLabel, isoToLocalDate, localDateToISO, todayLocalISO } from "@nutriai/shared/lib/format";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { enUS, ru, uz } from "react-day-picker/locale";

import { useSelectedDate } from "@/app/providers/selected-date-provider";

import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

const CALENDAR_LOCALE = { UZ: uz, RU: ru, EN: enUS } as const;

export function DateNav({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useTranslation();
  const { date, isToday, setDate, shiftDay, goToday } = useSelectedDate();
  const [open, setOpen] = useState(false);
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

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex h-8 flex-none items-center gap-1.5 rounded-[9px] border border-line px-2.5 text-[12px] font-medium text-tx2 transition-colors hover:border-line2 hover:text-tx data-[state=open]:border-acc data-[state=open]:text-tx">
            <CalendarIcon className="h-3.5 w-3.5 text-tx3" />
            <span className={compact ? "max-w-[110px] truncate" : "truncate"}>{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <Calendar
            mode="single"
            locale={CALENDAR_LOCALE[lang]}
            selected={isoToLocalDate(date)}
            defaultMonth={isoToLocalDate(date)}
            disabled={{ after: isoToLocalDate(todayLocalISO()) }}
            onSelect={(picked) => {
              if (!picked) return;
              setDate(localDateToISO(picked));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <button
        title={t.app.nextDay}
        disabled={isToday}
        onClick={() => shiftDay(1)}
        className="grid h-8 w-8 flex-none place-items-center rounded-[9px] border border-line text-tx3 transition-colors hover:bg-surf2 hover:text-tx disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {!compact && !isToday && (
        <Button variant="ghost" size="sm" onClick={goToday}>
          {t.app.backToToday}
        </Button>
      )}
    </div>
  );
}
