import { useParams } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAdminConversation } from '@/admin/shared/api/conversations'
import { AdminHeader } from '@/admin/shared/ui/admin-header'
import { AdminCard } from '@/admin/shared/ui/card'
import { AdminErrorState } from '@/admin/shared/ui/error-state'
import { AdminSkeleton } from '@/admin/shared/ui/skeleton'
import { usePermission } from '@/admin/shared/rbac/admin-auth-context'
import { useAdminTranslation } from '@/admin/shared/i18n/use-admin-translation'
import { cn } from '@/shared/lib/cn'

export function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useAdminTranslation()
  const canRead = usePermission('CONVERSATIONS_READ')
  const { data, isLoading, isError, refetch } = useAdminConversation(id, canRead)

  return (
    <div>
      <AdminHeader
        title={data?.title ?? t.conversations.detailTitle}
        subtitle={t.conversations.detailSubtitle}
        breadcrumbs={[{ label: t.conversations.title, to: '/admin/conversations' }, { label: data?.title ?? id ?? '' }]}
      />

      <div
        className="mb-4 flex items-center gap-2 rounded-[var(--adm-radius-md)] border px-3 py-2 text-[11.5px]"
        style={{ background: 'var(--adm-accent-subtle)', borderColor: 'var(--adm-border)', color: 'var(--adm-accent)' }}
      >
        <ShieldCheck className="h-3.5 w-3.5 flex-none" />
        {t.conversations.accessLoggedNote}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <AdminSkeleton className="h-14 w-3/4" />
          <AdminSkeleton className="h-14 w-2/3 self-end" />
          <AdminSkeleton className="h-14 w-3/4" />
        </div>
      )}

      {isError && <AdminErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="flex flex-col gap-3">
          {data.messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'USER' ? 'justify-start' : 'justify-end')}>
              <AdminCard className={cn('max-w-[75%]', msg.role === 'ASSISTANT' && 'border-[var(--adm-accent)]')}>
                <div className="mb-1 flex items-center justify-between gap-3 text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
                  <span className="font-medium" style={{ color: msg.role === 'ASSISTANT' ? 'var(--adm-accent)' : 'var(--adm-text-2)' }}>
                    {msg.role === 'USER' ? t.conversations.userRole : t.conversations.assistantRole}
                  </span>
                  <span className="adm-mono">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed" style={{ color: 'var(--adm-text)' }}>
                  {msg.content}
                </p>
              </AdminCard>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
