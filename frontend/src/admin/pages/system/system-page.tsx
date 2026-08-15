import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Database, KeyRound, Sparkles } from 'lucide-react'
import { useAdminSystemHealth } from '@/admin/shared/api/system'
import { AdminHeader } from '@/admin/shared/ui/admin-header'
import { AdminCard } from '@/admin/shared/ui/card'
import { AdminErrorState } from '@/admin/shared/ui/error-state'
import { AdminSkeleton } from '@/admin/shared/ui/skeleton'
import { AdminButton } from '@/admin/shared/ui/button'
import { StatusBadge, healthToneOf } from '@/admin/shared/ui/status-badge'
import { useAdminTranslation } from '@/admin/shared/i18n/use-admin-translation'
import type { HealthStatus } from '@/admin/shared/api/types'

export function SystemPage() {
  const { t } = useAdminTranslation()
  const { data, isLoading, isError, refetch } = useAdminSystemHealth()

  return (
    <div>
      <AdminHeader
        title={t.system.title}
        subtitle={t.system.subtitle}
        actions={
          <AdminButton asChild variant="secondary" size="sm">
            <Link to="/admin/system/errors">{t.system.viewErrors}</Link>
          </AdminButton>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminSkeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && !isLoading && <AdminErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthCard icon={<Cpu className="h-4 w-4" />} label={t.system.apiStatus} status={data.api.status} latencyMs={data.api.latencyMs} t={t} />
          <HealthCard icon={<Database className="h-4 w-4" />} label={t.system.databaseStatus} status={data.database.status} latencyMs={data.database.latencyMs} t={t} />
          <HealthCard icon={<KeyRound className="h-4 w-4" />} label={t.system.authStatus} status={data.auth.status} t={t} />
          <HealthCard icon={<Sparkles className="h-4 w-4" />} label={t.system.aiStatus} status={data.ai.status} t={t} />
        </div>
      )}
    </div>
  )
}

function HealthCard({
  icon,
  label,
  status,
  latencyMs,
  t,
}: {
  icon: ReactNode
  label: string
  status: HealthStatus | 'UNKNOWN'
  latencyMs?: number
  t: ReturnType<typeof useAdminTranslation>['t']
}) {
  const statusLabel =
    status === 'HEALTHY' ? t.system.statusHealthy : status === 'WARNING' ? t.system.statusWarning : status === 'ERROR' ? t.system.statusError : t.system.statusUnknown

  return (
    <AdminCard>
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--adm-radius-md)]" style={{ background: 'var(--adm-accent-subtle)', color: 'var(--adm-accent)' }}>
          {icon}
        </span>
        <StatusBadge tone={healthToneOf(status)} label={statusLabel} />
      </div>
      <div className="mt-3 text-[13px] font-semibold" style={{ color: 'var(--adm-text)' }}>
        {label}
      </div>
      {latencyMs !== undefined && (
        <div className="adm-mono mt-1 text-[11.5px]" style={{ color: 'var(--adm-text-3)' }}>
          {t.system.latency}: {latencyMs} ms
        </div>
      )}
    </AdminCard>
  )
}
