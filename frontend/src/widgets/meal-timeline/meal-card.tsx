import { useState } from "react";

import type { MealDto } from "@nutriai/shared/api/types";
import { localeTags, useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";
import { fmtNumber, formatTime } from "@nutriai/shared/lib/format";
import { ChevronDown } from "lucide-react";

import { DeleteMealButton } from "@/features/delete-meal/delete-meal-button";
import { EditMealDialog } from "@/features/edit-meal/edit-meal-dialog";

import { mealTypeLabel } from "@/entities/meal/lib/helpers";

export function MealCard({ meal, dayTotal }: { meal: MealDto; dayTotal: number }) {
  const { t, lang } = useTranslation();
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const pct = dayTotal > 0 ? Math.round((meal.calories / dayTotal) * 100) : 0;

  return (
    <div className="flex gap-4 border-t border-line py-4 md:gap-[18px]">
      <div className="w-11 flex-none pt-0.5 md:w-[52px]">
        <div className="font-mono text-[11.5px] text-tx2">{formatTime(meal.createdAt, localeTags[lang])}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex cursor-pointer items-center gap-3" onClick={() => setOpen((v) => !v)}>
          <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[13px] border border-line bg-surf text-[17px]">
            {meal.emoji ?? "🍽️"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold tracking-[-.012em] md:text-[15px]">{meal.name}</span>
            <span className="mt-0.5 block font-mono text-[10.5px] text-tx3">
              {mealTypeLabel(meal.mealType, t)} · {pct}%
            </span>
          </span>
          <span className="flex flex-none items-baseline gap-1">
            <span className="text-[17px] font-medium tracking-[-.02em] tabular-nums md:text-[19px]">{fmtNumber(meal.calories, lang)}</span>
            <span className="text-[11px] text-tx3">{t.kcal}</span>
          </span>
          <span className="ml-1.5 flex flex-none gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              title={t.edit}
              onClick={() => setEditing(true)}
              className="grid h-[29px] w-[29px] place-items-center rounded-[9px] text-tx3 transition-colors hover:bg-surf2 hover:text-tx"
            >
              <svg width="14" height="14" viewBox="0 0 16 16">
                <path d="M3 12.4 11.1 4.3l1.6 1.6L4.6 14H3v-1.6Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M9.8 3 11.4 4.6" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
            <DeleteMealButton mealId={meal.id} />
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-[29px] w-[29px] place-items-center rounded-[9px] text-tx3 transition-colors hover:bg-surf2 hover:text-tx"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
            </button>
          </span>
        </div>

        {open && (
          <div className="mt-3.5 animate-fu">
            {meal.items.length > 0 ? (
              <>
                <div className="flex flex-col gap-px overflow-hidden rounded-2xl border border-line bg-line">
                  {meal.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2.5 bg-surf px-3.5 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-[13px]">{it.name}</span>
                      <span className="font-mono text-[11.5px] text-tx2 tabular-nums">{fmtNumber(it.calories, lang)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-5">
                  <MacroLegend color="var(--pro)" label={t.mProtein} value={`${Math.round(meal.protein)} ${t.g}`} />
                  <MacroLegend color="var(--carb)" label={t.mCarbs} value={`${Math.round(meal.carbs)} ${t.g}`} />
                  <MacroLegend color="var(--fat)" label={t.mFat} value={`${Math.round(meal.fat)} ${t.g}`} />
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-line2 p-4 text-[13px] text-tx3">{meal.servingSize ?? "—"}</div>
            )}
          </div>
        )}
      </div>
      {editing && <EditMealDialog meal={meal} open={editing} onOpenChange={setEditing} />}
    </div>
  );
}

function MacroLegend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-tx2">
      <span className="h-[3px] w-3.5 rounded-full" style={{ background: color }} />
      {label} <span className="text-tx tabular-nums">{value}</span>
    </span>
  );
}
