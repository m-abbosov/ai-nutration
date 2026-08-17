import type { ReactNode } from 'react'
import { AlertTriangle, Inbox } from 'lucide-react'
import { AdminButton } from '@/shared/ui/button'
import { useAdminTranslation } from '@/shared/i18n/use-admin-translation'

export function AdminErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useAdminTranslation()
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-[var(--adm-radius-lg)] border border-dashed px-6 py-12 text-center"
      style={{ borderColor: 'var(--adm-border-strong)' }}
    >
      <AlertTriangle className="h-5 w-5" style={{ color: 'var(--adm-critical)' }} />
      <p className="text-[12.5px]" style={{ color: 'var(--adm-text-2)' }}>
        {message ?? t.errors.loadFailed}
      </p>
      {onRetry && (
        <AdminButton variant="secondary" size="sm" onClick={onRetry}>
          {t.common.retry}
        </AdminButton>
      )}
    </div>
  )
}

export function AdminEmptyState({ message, icon, action }: { message: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-[var(--adm-radius-lg)] border border-dashed px-6 py-12 text-center"
      style={{ borderColor: 'var(--adm-border-strong)' }}
    >
      {icon ?? <Inbox className="h-5 w-5" style={{ color: 'var(--adm-text-3)' }} />}
      <p className="text-[12.5px]" style={{ color: 'var(--adm-text-3)' }}>
        {message}
      </p>
      {action}
    </div>
  )
}
