import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAdminAiOverview, useAdminAiRequest, useAdminAiRequests } from '@/shared/api/ai'
import type { AdminAiRequestListItemDto } from '@/shared/api/types'
import { AdminHeader } from '@/shared/ui/admin-header'
import { KpiCard } from '@/shared/ui/kpi-card'
import { AdminChartCard, AdminChartTooltip, adminChartAxis, adminChartColors, adminChartGrid } from '@/shared/ui/chart-card'
import { DateRangePicker } from '@/shared/ui/date-range-picker'
import { AdminErrorState, AdminEmptyState } from '@/shared/ui/error-state'
import { DataTable, type DataTableColumn } from '@/shared/ui/data-table'
import { FilterBar } from '@/shared/ui/filter-bar'
import { AdminSelect, AdminSelectContent, AdminSelectItem, AdminSelectTrigger, AdminSelectValue } from '@/shared/ui/select'
import { StatusBadge, aiStatusToneOf } from '@/shared/ui/status-badge'
import { KpiGridSkeleton, ChartSkeleton, AdminSkeleton } from '@/shared/ui/skeleton'
import { DetailDrawer } from '@/shared/ui/detail-drawer'
import { IfPermission } from '@/shared/rbac/admin-auth-context'
import { useAdminTranslation } from '@/shared/i18n/use-admin-translation'
import { fmtNumber } from '@nutriai/shared/lib/format'
import type { Range } from '@/shared/api/types'

const PAGE_SIZE = 20

export function AiPage() {
  const { t, lang } = useAdminTranslation()
  const navigate = useNavigate()
  const { id: openRequestId } = useParams<{ id?: string }>()
  const [range, setRange] = useState<Range>('7d')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [endpoint, setEndpoint] = useState('')

  const overview = useAdminAiOverview(range)
  const requests = useAdminAiRequests({ page, pageSize: PAGE_SIZE, status: status || undefined, endpoint: endpoint || undefined })

  const rangeOptions = [
    { value: '7d' as Range, label: t.ranges.d7 },
    { value: '30d' as Range, label: t.ranges.d30 },
    { value: '90d' as Range, label: t.ranges.d90 },
    { value: '1y' as Range, label: t.ranges.y1 },
  ]

  const columns: DataTableColumn<AdminAiRequestListItemDto>[] = [
    { key: 'createdAt', header: t.ai.colTime, render: (row) => <span className="adm-mono text-[11.5px]">{new Date(row.createdAt).toLocaleString()}</span> },
    { key: 'userName', header: t.ai.colUser, render: (row) => <span>{row.userName ?? '—'}</span> },
    { key: 'endpoint', header: t.ai.colEndpoint, render: (row) => <span>{row.endpoint}</span> },
    { key: 'provider', header: t.ai.colProvider, render: (row) => <span>{row.provider}</span> },
    { key: 'model', header: t.ai.colModel, render: (row) => <span className="adm-mono text-[11.5px]">{row.model}</span> },
    { key: 'status', header: t.ai.colStatus, render: (row) => <StatusBadge tone={aiStatusToneOf(row.status)} label={row.status} /> },
    {
      key: 'responseTimeMs',
      header: t.ai.colResponseTime,
      align: 'right',
      render: (row) => <span className="adm-mono">{fmtNumber(row.responseTimeMs, lang)} ms</span>,
    },
    { key: 'errorReason', header: t.ai.colError, render: (row) => <span style={{ color: 'var(--adm-critical)' }}>{row.errorReason ?? '—'}</span> },
  ]

  return (
    <div>
      <AdminHeader title={t.ai.title} subtitle={t.ai.subtitle} actions={<DateRangePicker value={range} options={rangeOptions} onChange={setRange} />} />

      {overview.isLoading && (
        <div className="flex flex-col gap-4">
          <KpiGridSkeleton count={4} />
          <ChartSkeleton />
        </div>
      )}
      {overview.isError && !overview.isLoading && <AdminErrorState onRetry={() => overview.refetch()} />}

      {overview.data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard index={0} label={t.ai.totalRequests} value={fmtNumber(overview.data.requests, lang)} deltaPct={null} />
            <KpiCard index={1} label={t.ai.successRate} value={`${(100 - overview.data.errorRatePct).toFixed(1)}%`} deltaPct={null} />
            <KpiCard index={2} label={t.ai.errorRate} value={`${overview.data.errorRatePct.toFixed(1)}%`} deltaPct={null} invertTrend />
            <KpiCard index={3} label={t.ai.avgResponseTime} value={`${fmtNumber(overview.data.avgResponseTimeMs, lang)} ms`} deltaPct={null} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AdminChartCard title={t.ai.requestsPerDayTitle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview.data.requestsPerDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={adminChartGrid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({ name: t.ai.requestsPerDayTitle, value: Number(p.value), color: adminChartColors[0] }))}
                      />
                    )}
                  />
                  <Line type="monotone" dataKey="value" stroke={adminChartColors[0]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </AdminChartCard>

            <AdminChartCard title={t.ai.requestsPerEndpointTitle}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.data.requestsPerEndpoint} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={adminChartGrid} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis dataKey="endpoint" type="category" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={90} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({ name: t.ai.requestsPerEndpointTitle, value: Number(p.value), color: adminChartColors[2] }))}
                      />
                    )}
                  />
                  <Bar dataKey="count" fill={adminChartColors[2]} radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </AdminChartCard>
          </div>

          <div className="rounded-[var(--adm-radius-lg)] border p-4" style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)' }}>
            <div className="mb-2 text-[13px] font-semibold" style={{ color: 'var(--adm-text)' }}>
              {t.ai.tokenUsageTitle}
            </div>
            {overview.data.tokenUsage ? (
              <dl className="grid grid-cols-3 gap-3 text-[12px]">
                <TokenStat label={t.ai.promptTokens} value={fmtNumber(overview.data.tokenUsage.promptTokens, lang)} />
                <TokenStat label={t.ai.completionTokens} value={fmtNumber(overview.data.tokenUsage.completionTokens, lang)} />
                <TokenStat label={t.ai.totalTokens} value={fmtNumber(overview.data.tokenUsage.totalTokens, lang)} />
              </dl>
            ) : (
              <p className="text-[12px]" style={{ color: 'var(--adm-text-3)' }}>
                {t.ai.tokensNotReported}
              </p>
            )}
            <p className="mt-3 text-[11px]" style={{ color: 'var(--adm-text-3)' }}>
              {t.ai.noApiKeyNote}
            </p>
          </div>
        </div>
      )}

      <IfPermission permission="AI_LOGS_READ">
        <div className="mt-6">
          <div className="mb-3 text-[14px] font-semibold" style={{ color: 'var(--adm-text)' }}>
            {t.ai.requestsTableTitle}
          </div>
          <div className="mb-3">
            <FilterBar
              hasActiveFilters={!!(status || endpoint)}
              onClear={() => {
                setStatus('')
                setEndpoint('')
                setPage(1)
              }}
            >
              <AdminSelect value={status || '__all__'} onValueChange={(v) => { setStatus(v === '__all__' ? '' : v); setPage(1) }}>
                <AdminSelectTrigger className="w-[150px]">
                  <span className="mr-1" style={{ color: 'var(--adm-text-3)' }}>
                    {t.ai.filterStatus}:
                  </span>
                  <AdminSelectValue />
                </AdminSelectTrigger>
                <AdminSelectContent>
                  <AdminSelectItem value="__all__">{t.common.all}</AdminSelectItem>
                  <AdminSelectItem value="SUCCESS">SUCCESS</AdminSelectItem>
                  <AdminSelectItem value="ERROR">ERROR</AdminSelectItem>
                </AdminSelectContent>
              </AdminSelect>
              <AdminSelect value={endpoint || '__all__'} onValueChange={(v) => { setEndpoint(v === '__all__' ? '' : v); setPage(1) }}>
                <AdminSelectTrigger className="w-[170px]">
                  <span className="mr-1" style={{ color: 'var(--adm-text-3)' }}>
                    {t.ai.filterEndpoint}:
                  </span>
                  <AdminSelectValue />
                </AdminSelectTrigger>
                <AdminSelectContent>
                  <AdminSelectItem value="__all__">{t.common.all}</AdminSelectItem>
                  <AdminSelectItem value="CHAT">CHAT</AdminSelectItem>
                  <AdminSelectItem value="RECOMMENDATION">RECOMMENDATION</AdminSelectItem>
                </AdminSelectContent>
              </AdminSelect>
            </FilterBar>
          </div>

          {requests.isError ? (
            <AdminErrorState onRetry={() => requests.refetch()} />
          ) : (
            <DataTable
              columns={columns}
              rows={requests.data?.items ?? []}
              getRowId={(row) => row.id}
              total={requests.data?.total ?? 0}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              loading={requests.isLoading}
              onRowClick={(row) => navigate(`/ai/requests/${row.id}`)}
              emptyState={<AdminEmptyState message={t.ai.empty} />}
            />
          )}
        </div>
      </IfPermission>

      <AiRequestDrawer id={openRequestId} onClose={() => navigate('/ai')} />
    </div>
  )
}

function TokenStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
        {label}
      </div>
      <div className="adm-mono mt-0.5 text-[15px] font-semibold" style={{ color: 'var(--adm-text)' }}>
        {value}
      </div>
    </div>
  )
}

function AiRequestDrawer({ id, onClose }: { id: string | undefined; onClose: () => void }) {
  const { t, lang } = useAdminTranslation()
  const { data, isLoading, isError, refetch } = useAdminAiRequest(id)

  return (
    <DetailDrawer open={!!id} onOpenChange={(open) => !open && onClose()} title={t.ai.detailTitle} subtitle={id}>
      {isLoading && (
        <div className="flex flex-col gap-3">
          <AdminSkeleton className="h-4 w-full" />
          <AdminSkeleton className="h-4 w-3/4" />
          <AdminSkeleton className="h-4 w-1/2" />
        </div>
      )}
      {isError && <AdminErrorState onRetry={() => refetch()} />}
      {data && (
        <dl className="grid grid-cols-2 gap-4 text-[12.5px]">
          <DrawerField label={t.ai.colTime} value={new Date(data.createdAt).toLocaleString()} />
          <DrawerField label={t.ai.colUser} value={data.userName ?? '—'} />
          <DrawerField label={t.ai.colEndpoint} value={data.endpoint} />
          <DrawerField label={t.ai.colProvider} value={data.provider} />
          <DrawerField label={t.ai.colModel} value={data.model} />
          <div>
            <div className="text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
              {t.ai.colStatus}
            </div>
            <div className="mt-1">
              <StatusBadge tone={aiStatusToneOf(data.status)} label={data.status} />
            </div>
          </div>
          <DrawerField label={t.ai.colResponseTime} value={`${fmtNumber(data.responseTimeMs, lang)} ms`} />
          {data.errorReason && <DrawerField label={t.ai.colError} value={data.errorReason} full />}
          <DrawerField label={t.ai.promptTokens} value={data.promptTokens !== null ? fmtNumber(data.promptTokens, lang) : t.ai.tokensNotReported} />
          <DrawerField
            label={t.ai.completionTokens}
            value={data.completionTokens !== null ? fmtNumber(data.completionTokens, lang) : t.ai.tokensNotReported}
          />
          <DrawerField label={t.ai.totalTokens} value={data.totalTokens !== null ? fmtNumber(data.totalTokens, lang) : t.ai.tokensNotReported} />
        </dl>
      )}
      <p className="mt-5 border-t pt-3 text-[11px]" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-text-3)' }}>
        {t.ai.noApiKeyNote}
      </p>
    </DetailDrawer>
  )
}

function DrawerField({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : undefined}>
      <div className="text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
        {label}
      </div>
      <div className="mt-0.5 font-medium" style={{ color: 'var(--adm-text)' }}>
        {value}
      </div>
    </div>
  )
}
