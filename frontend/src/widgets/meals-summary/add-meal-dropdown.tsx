import { useState } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { AddMealManualDialog } from "@/features/add-meal-manual/add-meal-manual-dialog";

export function AddMealDropdown() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-[13px] bg-acc px-[17px] py-[11px] text-[13px] font-semibold text-[#04120e] shadow-[0_8px_22px_-10px_var(--accG)] transition-[filter,transform] hover:brightness-[1.08] active:scale-[0.97]"
      >
        <Plus className="h-[15px] w-[15px]" />
        {t.addMeal}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+9px)] z-40 w-[286px] animate-fu rounded-[17px] border border-line2 bg-surf2 p-[7px] shadow-card">
            <Link
              to="/chat"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-[13px] bg-accT p-2.5 text-left transition-[filter] hover:brightness-[1.12]"
            >
              <span
                className="h-8 w-8 flex-none rounded-full"
                style={{ background: "radial-gradient(circle at 32% 28%, var(--acc), var(--accD) 60%, var(--surf2))" }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">{t.optAI}</span>
                <span className="block truncate text-[11.5px] text-tx2">{t.optAISub}</span>
              </span>
              <span className="font-mono text-acc">→</span>
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                setManualOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-[13px] p-2.5 text-left transition-colors hover:bg-surfH"
            >
              <span className="grid h-8 w-8 flex-none place-items-center rounded-[10px] border border-line2 text-tx2">
                <Pencil className="h-[15px] w-[15px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">{t.optMan}</span>
                <span className="block truncate text-[11.5px] text-tx3">{t.optManSub}</span>
              </span>
            </button>
          </div>
        </>
      )}
      <AddMealManualDialog open={manualOpen} onOpenChange={setManualOpen} />
    </div>
  );
}
