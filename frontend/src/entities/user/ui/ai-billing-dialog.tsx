import type { AiProvider } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";

import { Button } from "@/shared/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

/** Shown when the user picks a paid provider (OpenAI/Claude) in the AI-key
 * select on onboarding or settings — makes explicit that billing happens on
 * the provider's own platform and none of that money goes to us. */
export function AiBillingDialog({ provider, open, onOpenChange }: { provider: AiProvider; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const label = t.aiProviderLabel[provider];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.app.aiBillingDialogTitle(label)}</DialogTitle>
          <DialogDescription>{t.app.aiBillingDialogBody(label)}</DialogDescription>
        </DialogHeader>
        <DialogClose asChild>
          <Button className="w-full">{t.app.aiBillingDialogCta}</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
