import { cn } from "@nutriai/shared/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DayPickerProps } from "react-day-picker";

export function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays
      navLayout="around"
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col",
        month: "relative flex flex-col gap-3",
        month_caption: "flex items-center justify-center px-8 pt-0.5 text-[12.5px] font-semibold capitalize",
        button_previous: cn(
          "absolute left-0 top-0.5 grid h-7 w-7 place-items-center rounded-[8px] text-tx3 transition-colors hover:bg-surfH hover:text-tx",
          "disabled:pointer-events-none disabled:opacity-30",
        ),
        button_next: cn(
          "absolute right-0 top-0.5 grid h-7 w-7 place-items-center rounded-[8px] text-tx3 transition-colors hover:bg-surfH hover:text-tx",
          "disabled:pointer-events-none disabled:opacity-30",
        ),
        month_grid: "mt-2 border-collapse",
        weekday: "w-8 pb-1.5 text-center font-mono text-[9px] font-normal tracking-[.08em] text-tx3",
        day: "w-8 p-0 text-center",
        day_button: cn(
          "mx-auto grid h-8 w-8 place-items-center rounded-[9px] text-[12.5px] text-tx2 outline-none transition-colors",
          "hover:bg-surfH hover:text-tx",
        ),
        selected: "[&>button]:bg-acc [&>button]:text-[#04120e] [&>button]:font-semibold [&>button]:hover:bg-acc",
        today: "[&>button]:border [&>button]:border-acc [&>button]:text-acc",
        outside: "[&>button]:text-tx3 [&>button]:opacity-40",
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
