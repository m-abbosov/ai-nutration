import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Power, ShieldCheck } from 'lucide-react'
import { useAdminTeamMember, useUpdateTeamMember } from '@/admin/shared/api/admin-team'
import type { AdminRoleName } from '@/admin/shared/api/types'
import { AdminHeader } from '@/admin/shared/ui/admin-header'
import { AdminCard, AdminCardHeader, AdminCardTitle } from '@/admin/shared/ui/card'
import { AdminErrorState } from '@/admin/shared/ui/error-state'
import { AdminSkeleton } from '@/admin/shared/ui/skeleton'
import { AdminButton } from '@/admin/shared/ui/button'
import { StatusBadge } from '@/admin/shared/ui/status-badge'
import { ConfirmDialog } from '@/admin/shared/ui/confirm-dialog'
import { AdminSelect, AdminSelectContent, AdminSelectItem, AdminSelectTrigger, AdminSelectValue } from '@/admin/shared/ui/select'
import { IfPermission, useAdminAuth } from '@/admin/shared/rbac/admin-auth-context'
import { useAdminTranslation } from '@/admin/shared/i18n/use-admin-translation'

const ROLES: AdminRoleName[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT']

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useAdminTranslation()
  const { admin: me } = useAdminAuth()
  const { data, isLoading, isError, refetch } = useAdminTeamMember(id)
  const mutation = useUpdateTeamMember(id ?? '')

  const [pendingRole, setPendingRole] = useState<AdminRoleName | null>(null)
  const [pendingActive, setPendingActive] = useState<boolean | null>(null)
  const [roleSelectValue, setRoleSelectValue] = useState<AdminRoleName | ''>('')

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <AdminSkeleton className="h-8 w-64" />
        <AdminSkeleton className="h-40 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div>
        <AdminHeader title={t.adminUserDetail.title} breadcrumbs={[{ label: t.adminUsers.title, to: '/admin/admin-users' }]} />
        <AdminErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  const isSelf = me?.id === data.id
  const selfIsSuperAdmin = me?.role.name === 'SUPER_ADMIN'

  const roleChangeWouldLockout = isSelf && selfIsSuperAdmin && pendingRole !== null && pendingRole !== 'SUPER_ADMIN'
  const deactivateWouldLockout = isSelf && selfIsSuperAdmin && pendingActive === false

  return (
    <div>
      <AdminHeader
        title={data.name}
        breadcrumbs={[{ label: t.adminUsers.title, to: '/admin/admin-users' }, { label: data.name }]}
        actions={
          <IfPermission permission="ADMIN_USERS_MANAGE">
            <AdminButton
              variant={data.adminActive ? 'outlineDestructive' : 'primary'}
              size="sm"
              onClick={() => setPendingActive(!data.adminActive)}
            >
              <Power className="h-3.5 w-3.5" />
              {data.adminActive ? t.adminUserDetail.deactivate : t.adminUserDetail.activate}
            </AdminButton>
          </IfPermission>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.adminUserDetail.roleSection}</AdminCardTitle>
          </AdminCardHeader>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[15px] font-semibold" style={{ color: 'var(--adm-text)' }}>
              {data.role}
            </span>
            <StatusBadge tone={data.adminActive ? 'good' : 'critical'} label={data.adminActive ? t.common.active : t.common.disabled} />
          </div>
          <p className="mt-2 text-[11.5px]" style={{ color: 'var(--adm-text-3)' }}>
            {t.adminUserDetail.lastLogin}: {data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString() : t.common.never}
          </p>
          <p className="text-[11.5px]" style={{ color: 'var(--adm-text-3)' }}>
            {t.adminUserDetail.created}: {new Date(data.createdAt).toLocaleDateString()}
          </p>

          <IfPermission permission="ADMIN_USERS_MANAGE">
            <div className="mt-4 flex items-center gap-2 border-t pt-3" style={{ borderColor: 'var(--adm-border)' }}>
              <AdminSelect value={roleSelectValue || data.role} onValueChange={(v) => setRoleSelectValue(v as AdminRoleName)}>
                <AdminSelectTrigger className="flex-1">
                  <AdminSelectValue />
                </AdminSelectTrigger>
                <AdminSelectContent>
                  {ROLES.map((r) => (
                    <AdminSelectItem key={r} value={r}>
                      {r}
                    </AdminSelectItem>
                  ))}
                </AdminSelectContent>
              </AdminSelect>
              <AdminButton
                size="sm"
                variant="secondary"
                disabled={!roleSelectValue || roleSelectValue === data.role}
                onClick={() => setPendingRole(roleSelectValue as AdminRoleName)}
              >
                {t.adminUserDetail.changeRole}
              </AdminButton>
            </div>
          </IfPermission>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.adminUserDetail.permissionsSection}</AdminCardTitle>
          </AdminCardHeader>
          <div className="flex flex-wrap gap-1.5">
            {data.permissions.length === 0 ? (
              <span className="text-[12px]" style={{ color: 'var(--adm-text-3)' }}>
                —
              </span>
            ) : (
              data.permissions.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium"
                  style={{ background: 'var(--adm-accent-subtle)', color: 'var(--adm-accent)' }}
                >
                  <ShieldCheck className="h-2.5 w-2.5" />
                  {p}
                </span>
              ))
            )}
          </div>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.adminUserDetail.activitySection}</AdminCardTitle>
          </AdminCardHeader>
          {data.activityLog.length === 0 ? (
            <p className="py-6 text-center text-[12px]" style={{ color: 'var(--adm-text-3)' }}>
              {t.adminUserDetail.noActivity}
            </p>
          ) : (
            <ul className="flex flex-col">
              {data.activityLog.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-2 border-b py-2 text-[11.5px] last:border-b-0" style={{ borderColor: 'var(--adm-border)' }}>
                  <span style={{ color: 'var(--adm-text)' }}>{entry.action}</span>
                  <span className="adm-mono" style={{ color: 'var(--adm-text-3)' }}>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <ConfirmDialog
        open={pendingRole !== null}
        onOpenChange={(open) => !open && setPendingRole(null)}
        title={t.adminUserDetail.confirmRoleChangeTitle}
        description={t.adminUserDetail.confirmRoleChangeBody}
        disabledReason={roleChangeWouldLockout ? t.adminUserDetail.selfLockoutBlocked : undefined}
        loading={mutation.isPending}
        onConfirm={() => {
          if (!pendingRole) return
          mutation.mutate(
            { role: pendingRole },
            {
              onSuccess: () => {
                setPendingRole(null)
                setRoleSelectValue('')
              },
            },
          )
        }}
      />

      <ConfirmDialog
        open={pendingActive !== null}
        onOpenChange={(open) => !open && setPendingActive(null)}
        title={pendingActive ? t.adminUserDetail.confirmActivateTitle : t.adminUserDetail.confirmDeactivateTitle}
        description={pendingActive ? t.adminUserDetail.confirmActivateBody : t.adminUserDetail.confirmDeactivateBody}
        destructive={!pendingActive}
        disabledReason={deactivateWouldLockout ? t.adminUserDetail.selfLockoutBlocked : undefined}
        loading={mutation.isPending}
        onConfirm={() => {
          if (pendingActive === null) return
          mutation.mutate({ adminActive: pendingActive }, { onSuccess: () => setPendingActive(null) })
        }}
      />
    </div>
  )
}
