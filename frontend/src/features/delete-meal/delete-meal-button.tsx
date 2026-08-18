import { useState } from "react";
import type { MouseEvent } from "react";

import { useTranslation } from "@nutriai/shared/i18n";
import { Trash2 } from "lucide-react";

import { useDeleteMeal } from "@/shared/api/meals";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

export function DeleteMealButton({ mealId }: { mealId: string }) {
  const { t } = useTranslation();
  const deleteMeal = useDeleteMeal();
  const [confirming, setConfirming] = useState(false);

  const openConfirm = (e: MouseEvent) => {
    e.stopPropagation();
    setConfirming(true);
  };

  const confirmDelete = () => {
    deleteMeal.mutate(mealId, { onSuccess: () => setConfirming(false) });
  };

  return (
    <>
      <button
        title={t.del}
        onClick={openConfirm}
        className="grid h-[29px] w-[29px] place-items-center rounded-[9px] text-tx3 transition-colors hover:bg-fatT hover:text-fat"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{t.app.confirmDeleteMealTitle}</DialogTitle>
            <DialogDescription>{t.app.confirmDeleteMeal}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2.5">
            <Button type="button" variant="secondary" onClick={() => setConfirming(false)}>
              {t.app.cancel}
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteMeal.isPending}>
              {t.app.delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
