import {
  AdminDialog,
  AdminDialogContent,
  AdminDialogDescription,
  AdminDialogHeader,
  AdminDialogTitle,
} from '@/admin/shared/ui/dialog'
import { AdminButton } from '@/admin/shared/ui/button'
import { useAdminTranslation } from '@/admin/shared/i18n/use-admin-translation'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  loading = false,
  disabledReason,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  /** If set, confirming is disabled and this reason is shown instead (e.g. self-lockout). */
  disabledReason?: string
  onConfirm: () => void
}) {
  const { t } = useAdminTranslation()
  return (
    <AdminDialog open={open} onOpenChange={onOpenChange}>
      <AdminDialogContent>
        <AdminDialogHeader>
          <AdminDialogTitle>{title}</AdminDialogTitle>
          <AdminDialogDescription>{disabledReason ?? description}</AdminDialogDescription>
        </AdminDialogHeader>
        <div className="flex justify-end gap-2">
          <AdminButton variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </AdminButton>
          <AdminButton
            variant={destructive ? 'destructive' : 'primary'}
            size="sm"
            disabled={loading || !!disabledReason}
            onClick={onConfirm}
          >
            {confirmLabel ?? t.common.confirm}
          </AdminButton>
        </div>
      </AdminDialogContent>
    </AdminDialog>
  )
}
