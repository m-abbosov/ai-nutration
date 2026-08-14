import type { ReactNode } from 'react'
import { AlertTriangle, Inbox } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line2 px-6 py-10 text-center">
      <AlertTriangle className="h-5 w-5 text-fat" />
      <p className="text-[13px] text-tx2">{message ?? t.app.error}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t.app.retry}
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ message, icon, action }: { message: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line2 px-6 py-10 text-center">
      {icon ?? <Inbox className="h-5 w-5 text-tx3" />}
      <p className="text-[13px] text-tx3">{message}</p>
      {action}
    </div>
  )
}
