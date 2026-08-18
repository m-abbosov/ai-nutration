import { useState } from "react";

import { ApiError } from "@nutriai/shared/api/client";
import { useTranslation } from "@nutriai/shared/i18n";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider";

import { useRequestRecommendations } from "@/shared/api/recommendations";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { ErrorState } from "@/shared/ui/state-blocks";

import { RecommendationsCard } from "@/widgets/chat-window/recommendations-card";

export function RequestRecommendationButton() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const requestRecs = useRequestRecommendations();
  const aiConfigured = !!user?.aiProvider;

  const handleOpen = () => {
    setOpen(true);
    if (aiConfigured && !requestRecs.data) requestRecs.mutate(undefined);
  };

  const errorMessage = requestRecs.error instanceof ApiError ? requestRecs.error.message : t.app.error;

  return (
    <>
      <Button variant="secondary" onClick={handleOpen}>
        <Sparkles className="h-3.5 w-3.5" />
        {t.app.getRecommendations}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.app.recommendationsTitle}</DialogTitle>
            <DialogDescription>{t.aiBadge}</DialogDescription>
          </DialogHeader>
          {!aiConfigured ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-[13px] text-tx2">{t.app.aiRecommendationsBanner}</p>
              <Button asChild size="sm">
                <Link to="/settings">{t.app.aiGoToSettings}</Link>
              </Button>
            </div>
          ) : (
            <>
              {requestRecs.isPending && <p className="text-[13px] text-tx3">{t.app.loading}</p>}
              {requestRecs.isError && <ErrorState message={errorMessage} onRetry={() => requestRecs.mutate(undefined)} />}
              {requestRecs.data && <RecommendationsCard items={requestRecs.data.recommendations} />}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
