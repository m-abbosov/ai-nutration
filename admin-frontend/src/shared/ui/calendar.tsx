import { cn } from "@nutriai/shared/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";

export function AdminCalendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays
      navLayout="around"
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col",
        month: "relative flex flex-col gap-2.5",
        month_caption: "flex items-center justify-center px-8 pt-0.5 text-[12px] font-semibold capitalize text-[var(--adm-text)]",
        button_previous: cn(
          "absolute left-0 top-0.5 grid h-6 w-6 place-items-center rounded-[var(--adm-radius-sm)] text-[var(--adm-text-3)] transition-colors",
          "hover:bg-[var(--adm-surface-hover)] hover:text-[var(--adm-text)] disabled:pointer-events-none disabled:opacity-30",
        ),
        button_next: cn(
          "absolute right-0 top-0.5 grid h-6 w-6 place-items-center rounded-[var(--adm-radius-sm)] text-[var(--adm-text-3)] transition-colors",
          "hover:bg-[var(--adm-surface-hover)] hover:text-[var(--adm-text)] disabled:pointer-events-none disabled:opacity-30",
        ),
        month_grid: "mt-1.5 border-collapse",
        weekday: "w-7 pb-1 text-center font-mono text-[8.5px] font-normal tracking-[.08em] text-[var(--adm-text-3)]",
        day: "w-7 p-0 text-center",
        day_button: cn(
          "mx-auto grid h-7 w-7 place-items-center rounded-[var(--adm-radius-sm)] text-[11.5px] text-[var(--adm-text-2)] outline-none transition-colors",
          "hover:bg-[var(--adm-surface-hover)] hover:text-[var(--adm-text)]",
        ),
        selected:
          "[&>button]:bg-[var(--adm-accent)] [&>button]:text-[var(--adm-text-on-accent)] [&>button]:font-semibold [&>button]:hover:bg-[var(--adm-accent)]",
        range_start: "[&>button]:bg-[var(--adm-accent)] [&>button]:text-[var(--adm-text-on-accent)] [&>button]:font-semibold",
        range_end: "[&>button]:bg-[var(--adm-accent)] [&>button]:text-[var(--adm-text-on-accent)] [&>button]:font-semibold",
        range_middle: "[&>button]:bg-[var(--adm-accent-subtle)] [&>button]:text-[var(--adm-accent)] [&>button]:rounded-[3px]",
        today: "[&>button]:border [&>button]:border-[var(--adm-accent)] [&>button]:text-[var(--adm-accent)]",
        outside: "[&>button]:text-[var(--adm-text-3)] [&>button]:opacity-40",
        disabled: "[&>button]:pointer-events-none [&>button]:opacity-25",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (orientation === "left" ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />),
      }}
      {...props}
    />
  );
}
