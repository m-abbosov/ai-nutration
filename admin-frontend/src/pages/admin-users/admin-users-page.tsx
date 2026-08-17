import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAdminTeam } from '@/shared/api/admin-team'
import type { AdminTeamMemberDto } from '@/shared/api/types'
import { AdminHeader } from '@/shared/ui/admin-header'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'
import { StatusBadge } from '@/shared/ui/status-badge'
import { AdminErrorState, AdminEmptyState } from '@/shared/ui/error-state'
import { AdminButton } from '@/shared/ui/button'
import { IfPermission } from '@/shared/rbac/admin-auth-context'
import { useAdminTranslation } from '@/shared/i18n/use-admin-translation'
import { PromoteUserDialog } from '@/features/promote-user/promote-user-dialog'

export function AdminUsersPage() {
  const { t } = useAdminTranslation()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useAdminTeam()
  const [promoteOpen, setPromoteOpen] = useState(false)

  const columns: DataTableColumn<AdminTeamMemberDto>[] = [
    {
      key: 'name',
      header: t.adminUsers.colName,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt="" className="h-6 w-6 flex-none rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span
              className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-semibold"
              style={{ background: 'var(--adm-accent-subtle)', color: 'var(--adm-accent)' }}
            >
              {row.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate font-medium">{row.name}</div>
            <div className="truncate text-[11px]" style={{ color: 'var(--adm-text-3)' }}>
              {row.email ?? '—'}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'role', header: t.adminUsers.colRole, render: (row) => <span className="font-medium">{row.role}</span> },
    {
      key: 'adminActive',
      header: t.adminUsers.colStatus,
      render: (row) => <StatusBadge tone={row.adminActive ? 'good' : 'critical'} label={row.adminActive ? t.common.active : t.common.disabled} />,
    },
    {
      key: 'lastLoginAt',
      header: t.adminUsers.colLastLogin,
      render: (row) => <span className="adm-mono text-[11.5px]">{row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : t.common.never}</span>,
    },
    { key: 'createdAt', header: t.adminUsers.colCreated, render: (row) => <span className="adm-mono text-[11.5px]">{new Date(row.createdAt).toLocaleDateString()}</span> },
  ]

  return (
    <div>
      <AdminHeader
        title={t.adminUsers.title}
        subtitle={t.adminUsers.subtitle}
        actions={
          <IfPermission permission="ADMIN_USERS_MANAGE">
            <AdminButton size="sm" onClick={() => setPromoteOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" />
              {t.adminUsers.promote}
            </AdminButton>
          </IfPermission>
        }
      />

      {isError ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          getRowId={(row) => row.id}
          total={data?.length ?? 0}
          page={1}
          pageSize={Math.max(data?.length ?? 1, 1)}
          onPageChange={() => {}}
          loading={isLoading}
          onRowClick={(row) => navigate(`/admin-users/${row.id}`)}
          emptyState={<AdminEmptyState message={t.adminUsers.empty} />}
        />
      )}

      <PromoteUserDialog open={promoteOpen} onOpenChange={setPromoteOpen} />
    </div>
  )
}
