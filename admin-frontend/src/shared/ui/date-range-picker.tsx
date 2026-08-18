import { cn } from "@nutriai/shared/lib/cn";
import { isoToLocalDate, localDateToISO, todayLocalISO } from "@nutriai/shared/lib/format";
import { Calendar as CalendarIcon } from "lucide-react";
import { enUS, ru, uz } from "react-day-picker/locale";

import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { AdminCalendar } from "@/shared/ui/calendar";
import { AdminPopover, AdminPopoverContent, AdminPopoverTrigger } from "@/shared/ui/popover";

const CALENDAR_LOCALE = { UZ: uz, RU: ru, EN: enUS } as const;

export interface RangeOption<T extends string> {
  value: T;
  label: string;
}

export function DateRangePicker<T extends string>({
  value,
  options,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: {
  value: T;
  options: RangeOption<T>[];
  onChange: (value: T) => void;
  customFrom?: string;
  customTo?: string;
  onCustomChange?: (from: string, to: string) => void;
}) {
  const { t, lang } = useAdminTranslation();
  const isCustom = value === "custom";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex items-center gap-0.5 rounded-[var(--adm-radius-md)] border p-0.5"
        style={{ background: "var(--adm-bg-inset)", borderColor: "var(--adm-border)" }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn("rounded-[var(--adm-radius-sm)] px-2.5 py-1 text-[12px] font-medium transition-colors")}
              style={{
                background: active ? "var(--adm-surface)" : "transparent",
                color: active ? "var(--adm-text)" : "var(--adm-text-3)",
                boxShadow: active ? "var(--adm-shadow-sm)" : "none",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {isCustom && onCustomChange && (
        <AdminPopover>
          <AdminPopoverTrigger asChild>
            <button
              type="button"
              className="flex h-8 items-center gap-1.5 rounded-[var(--adm-radius-sm)] border px-2.5 text-[12px] font-medium transition-colors hover:brightness-105"
              style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border-strong)", color: "var(--adm-text)" }}
            >
              <CalendarIcon className="h-3.5 w-3.5" style={{ color: "var(--adm-text-3)" }} />
              <span>{customFrom || t.ranges.from}</span>
              <span style={{ color: "var(--adm-text-3)" }}>–</span>
              <span>{customTo || t.ranges.to}</span>
            </button>
          </AdminPopoverTrigger>
          <AdminPopoverContent>
            <AdminCalendar
              mode="range"
              locale={CALENDAR_LOCALE[lang]}
              selected={{
                from: customFrom ? isoToLocalDate(customFrom) : undefined,
                to: customTo ? isoToLocalDate(customTo) : undefined,
              }}
              defaultMonth={customFrom ? isoToLocalDate(customFrom) : isoToLocalDate(todayLocalISO())}
              disabled={{ after: isoToLocalDate(todayLocalISO()) }}
              onSelect={(range) => {
                onCustomChange(range?.from ? localDateToISO(range.from) : "", range?.to ? localDateToISO(range.to) : "");
              }}
            />
          </AdminPopoverContent>
        </AdminPopover>
      )}
    </div>
  );
}
