import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAdminSystemErrors } from '@/admin/shared/api/system'
import type { AdminSystemLogDto } from '@/admin/shared/api/types'
import { AdminHeader } from '@/admin/shared/ui/admin-header'
import { DataTable, type DataTableColumn } from '@/admin/shared/ui/data-table'
import { FilterBar } from '@/admin/shared/ui/filter-bar'
import { AdminSelect, AdminSelectContent, AdminSelectItem, AdminSelectTrigger, AdminSelectValue } from '@/admin/shared/ui/select'
import { StatusBadge, severityToneOf } from '@/admin/shared/ui/status-badge'
import { AdminErrorState, AdminEmptyState } from '@/admin/shared/ui/error-state'
import { useAdminTranslation } from '@/admin/shared/i18n/use-admin-translation'

const PAGE_SIZE = 20

export function SystemErrorsPage() {
  const { t } = useAdminTranslation()
  const [page, setPage] = useState(1)
  const [severity, setSeverity] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useAdminSystemErrors({ page, pageSize: PAGE_SIZE, severity: severity || undefined })

  const columns: DataTableColumn<AdminSystemLogDto>[] = [
    { key: 'createdAt', header: t.systemErrors.colTime, render: (row) => <span className="adm-mono text-[11.5px]">{new Date(row.createdAt).toLocaleString()}</span> },
    { key: 'severity', header: t.systemErrors.colSeverity, render: (row) => <StatusBadge tone={severityToneOf(row.severity)} label={row.severity} /> },
    {
      key: 'message',
      header: t.systemErrors.colMessage,
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="truncate">{row.message}</span>
            {row.stack && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(expanded === row.id ? null : row.id)
                }}
                className="flex flex-none items-center gap-0.5 text-[10.5px]"
                style={{ color: 'var(--adm-accent)' }}
              >
                {expanded === row.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expanded === row.id ? t.systemErrors.hideStack : t.systemErrors.showStack}
              </button>
            )}
          </div>
          {expanded === row.id && (
            <pre
              className="adm-mono mt-2 max-w-[70vw] overflow-x-auto rounded-[var(--adm-radius-sm)] p-2 text-[10.5px] leading-relaxed"
              style={{ background: 'var(--adm-bg-inset)', color: 'var(--adm-text-2)' }}
            >
              {row.stack ?? t.systemErrors.noStack}
            </pre>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader
        title={t.systemErrors.title}
        subtitle={t.systemErrors.subtitle}
        breadcrumbs={[{ label: t.system.title, to: '/admin/system' }, { label: t.systemErrors.title }]}
      />

      <div className="mb-4">
        <FilterBar hasActiveFilters={!!severity} onClear={() => { setSeverity(''); setPage(1) }}>
          <AdminSelect value={severity || '__all__'} onValueChange={(v) => { setSeverity(v === '__all__' ? '' : v); setPage(1) }}>
            <AdminSelectTrigger className="w-[160px]">
              <span className="mr-1" style={{ color: 'var(--adm-text-3)' }}>
                {t.systemErrors.filterSeverity}:
              </span>
              <AdminSelectValue />
            </AdminSelectTrigger>
            <AdminSelectContent>
              <AdminSelectItem value="__all__">{t.common.all}</AdminSelectItem>
              <AdminSelectItem value="INFO">INFO</AdminSelectItem>
              <AdminSelectItem value="WARNING">WARNING</AdminSelectItem>
              <AdminSelectItem value="ERROR">ERROR</AdminSelectItem>
            </AdminSelectContent>
          </AdminSelect>
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
          loading={isLoading}
          emptyState={<AdminEmptyState message={t.emptyStates.noSystemErrors} />}
        />
      )}
    </div>
  )
}
