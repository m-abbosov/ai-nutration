import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ban, CheckCircle2 } from 'lucide-react'
import { useAdminUsers, useUpdateUserStatus } from '@/shared/api/users'
import type { AdminUserListItemDto } from '@/shared/api/types'
import { AdminHeader } from '@/shared/ui/admin-header'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'
import { FilterBar } from '@/shared/ui/filter-bar'
import { AdminSelect, AdminSelectContent, AdminSelectItem, AdminSelectTrigger, AdminSelectValue } from '@/shared/ui/select'
import { StatusBadge, userStatusToneOf } from '@/shared/ui/status-badge'
import { AdminEmptyState, AdminErrorState } from '@/shared/ui/error-state'
import { AdminButton } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { IfPermission } from '@/shared/rbac/admin-auth-context'
import { useAdminTranslation } from '@/shared/i18n/use-admin-translation'
import { fmtNumber } from '@nutriai/shared/lib/format'

const PAGE_SIZE = 20

export function UsersPage() {
  const navigate = useNavigate()
  const { t, lang } = useAdminTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [goal, setGoal] = useState<string>('')
  const [authProvider, setAuthProvider] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'lastActiveAt' | 'name'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [pendingStatusChange, setPendingStatusChange] = useState<AdminUserListItemDto | null>(null)

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    goal: goal || undefined,
    authProvider: authProvider || undefined,
    status: status || undefined,
    sortBy,
    sortDir,
  })

  const hasActiveFilters = !!(search || goal || authProvider || status)

  const columns: DataTableColumn<AdminUserListItemDto>[] = [
    {
      key: 'name',
      header: t.users.colUser,
      sortable: true,
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
              {row.email ?? row.telegramId ?? '—'}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'authProvider', header: t.users.colAuth, render: (row) => <span>{row.authProvider}</span> },
    { key: 'goal', header: t.users.colGoal, render: (row) => <span>{row.goal ?? '—'}</span> },
    { key: 'weightKg', header: t.users.colWeight, align: 'right', render: (row) => <span className="adm-mono">{row.weightKg ?? '—'}</span> },
    {
      key: 'dailyCalorieTarget',
      header: t.users.colTarget,
      align: 'right',
      render: (row) => <span className="adm-mono">{row.dailyCalorieTarget ?? '—'}</span>,
    },
    { key: 'mealsCount', header: t.users.colMeals, align: 'right', render: (row) => <span className="adm-mono">{fmtNumber(row.mealsCount, lang)}</span> },
    {
      key: 'aiRequestsCount',
      header: t.users.colAiRequests,
      align: 'right',
      render: (row) => <span className="adm-mono">{fmtNumber(row.aiRequestsCount, lang)}</span>,
    },
    {
      key: 'createdAt',
      header: t.users.colRegistered,
      sortable: true,
      render: (row) => <span className="adm-mono text-[11.5px]">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'lastActiveAt',
      header: t.users.colLastActive,
      sortable: true,
      render: (row) => (
        <span className="adm-mono text-[11.5px]">{row.lastActiveAt ? new Date(row.lastActiveAt).toLocaleDateString() : t.common.never}</span>
      ),
    },
    { key: 'status', header: t.users.colStatus, render: (row) => <StatusBadge tone={userStatusToneOf(row.status)} label={row.status} /> },
    {
      key: 'actions',
      header: t.common.actions,
      render: (row) => (
        <IfPermission permission="USERS_DISABLE">
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setPendingStatusChange(row)
            }}
          >
            {row.status === 'ACTIVE' ? <Ban className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
            {row.status === 'ACTIVE' ? t.users.disableUser : t.users.enableUser}
          </AdminButton>
        </IfPermission>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader title={t.users.title} subtitle={t.users.subtitle} />

      <div className="mb-4">
        <FilterBar
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          searchPlaceholder={t.users.searchPlaceholder}
          hasActiveFilters={hasActiveFilters}
          onClear={() => {
            setSearch('')
            setGoal('')
            setAuthProvider('')
            setStatus('')
            setPage(1)
          }}
        >
          <SimpleSelect
            value={goal}
            onChange={(v) => {
              setGoal(v)
              setPage(1)
            }}
            placeholder={t.users.filterGoal}
            options={['LOSE', 'MAINTAIN', 'GAIN']}
          />
          <SimpleSelect
            value={authProvider}
            onChange={(v) => {
              setAuthProvider(v)
              setPage(1)
            }}
            placeholder={t.users.filterAuthProvider}
            options={['google', 'telegram']}
          />
          <SimpleSelect
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
            placeholder={t.users.filterStatus}
            options={['ACTIVE', 'DISABLED']}
          />
        </FilterBar>
      </div>

      {isError ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowId={(row) => row.id}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={(key) => {
            if (key === sortBy) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
            else {
              setSortBy(key as typeof sortBy)
              setSortDir('desc')
            }
          }}
          loading={isLoading}
          onRowClick={(row) => navigate(`/users/${row.id}`)}
          emptyState={<AdminEmptyState message={t.emptyStates.noUsers} />}
        />
      )}

      {pendingStatusChange && (
        <UserStatusConfirm user={pendingStatusChange} onClose={() => setPendingStatusChange(null)} />
      )}
    </div>
  )
}

function UserStatusConfirm({ user, onClose }: { user: AdminUserListItemDto; onClose: () => void }) {
  const { t } = useAdminTranslation()
  const mutation = useUpdateUserStatus(user.id)
  const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  const isDisabling = nextStatus === 'DISABLED'

  return (
    <ConfirmDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={isDisabling ? t.users.disableConfirmTitle : t.users.enableConfirmTitle}
      description={isDisabling ? t.users.disableConfirmBody : t.users.enableConfirmBody}
      destructive={isDisabling}
      confirmLabel={isDisabling ? t.users.disableUser : t.users.enableUser}
      loading={mutation.isPending}
      onConfirm={() => mutation.mutate(nextStatus, { onSuccess: onClose })}
    />
  )
}

function SimpleSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: string[]
}) {
  const { t } = useAdminTranslation()
  return (
    <AdminSelect value={value || '__all__'} onValueChange={(v) => onChange(v === '__all__' ? '' : v)}>
      <AdminSelectTrigger className="w-[150px]">
        <span className="mr-1" style={{ color: 'var(--adm-text-3)' }}>
          {placeholder}:
        </span>
        <AdminSelectValue className="flex-1 text-left" />
      </AdminSelectTrigger>
      <AdminSelectContent>
        <AdminSelectItem value="__all__">{t.common.all}</AdminSelectItem>
        {options.map((o) => (
          <AdminSelectItem key={o} value={o}>
            {o}
          </AdminSelectItem>
        ))}
      </AdminSelectContent>
    </AdminSelect>
  )
}
