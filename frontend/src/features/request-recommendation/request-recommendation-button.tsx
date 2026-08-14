import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { useRequestRecommendations } from '@/shared/api/recommendations'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { RecommendationsCard } from '@/widgets/chat-window/recommendations-card'
import { ErrorState } from '@/shared/ui/state-blocks'

export function RequestRecommendationButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const requestRecs = useRequestRecommendations()

  const handleOpen = () => {
    setOpen(true)
    if (!requestRecs.data) requestRecs.mutate(undefined)
  }

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
          {requestRecs.isPending && <p className="text-[13px] text-tx3">{t.app.loading}</p>}
          {requestRecs.isError && (
            <ErrorState message={t.app.error} onRetry={() => requestRecs.mutate(undefined)} />
          )}
          {requestRecs.data && <RecommendationsCard items={requestRecs.data.recommendations} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
