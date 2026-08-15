import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Ban, CheckCircle2 } from 'lucide-react'
import { useAdminUser, useUpdateUserStatus } from '@/admin/shared/api/users'
import { AdminHeader } from '@/admin/shared/ui/admin-header'
import { AdminCard, AdminCardHeader, AdminCardTitle } from '@/admin/shared/ui/card'
import { AdminChartTooltip, adminChartAxis, adminChartColors, adminChartGrid } from '@/admin/shared/ui/chart-card'
import { AdminErrorState } from '@/admin/shared/ui/error-state'
import { AdminSkeleton } from '@/admin/shared/ui/skeleton'
import { AdminButton } from '@/admin/shared/ui/button'
import { StatusBadge, userStatusToneOf } from '@/admin/shared/ui/status-badge'
import { ConfirmDialog } from '@/admin/shared/ui/confirm-dialog'
import { IfPermission } from '@/admin/shared/rbac/admin-auth-context'
import { useAdminTranslation } from '@/admin/shared/i18n/use-admin-translation'
import { fmtNumber } from '@/shared/lib/format'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, lang } = useAdminTranslation()
  const { data, isLoading, isError, refetch } = useAdminUser(id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <AdminSkeleton className="h-8 w-64" />
        <AdminSkeleton className="h-40 w-full" />
        <AdminSkeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div>
        <AdminHeader title={t.userDetail.title} breadcrumbs={[{ label: t.users.title, to: '/admin/users' }, { label: id ?? '' }]} />
        <AdminErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  const { profile, account, nutrition, calorieHistory, aiStats, recentMeals, recentActivity } = data
  const nextStatus = account.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'

  return (
    <div>
      <AdminHeader
        title={profile.name}
        breadcrumbs={[{ label: t.users.title, to: '/admin/users' }, { label: profile.name }]}
        actions={
          <IfPermission permission="USERS_DISABLE">
            <AdminButton variant={account.status === 'ACTIVE' ? 'outlineDestructive' : 'primary'} size="sm" onClick={() => setConfirmOpen(true)}>
              {account.status === 'ACTIVE' ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {account.status === 'ACTIVE' ? t.users.disableUser : t.users.enableUser}
            </AdminButton>
          </IfPermission>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.userDetail.profileSection}</AdminCardTitle>
          </AdminCardHeader>
          <dl className="grid grid-cols-2 gap-3 text-[12px]">
            <Field label={t.userDetail.age} value={profile.age ?? t.userDetail.notAvailable} />
            <Field label={t.userDetail.height} value={profile.heightCm ? `${profile.heightCm} cm` : t.userDetail.notAvailable} />
            <Field label={t.userDetail.weight} value={profile.weightKg ? `${profile.weightKg} kg` : t.userDetail.notAvailable} />
            <Field label={t.userDetail.goal} value={profile.goal ?? t.userDetail.notAvailable} />
            <Field label={t.userDetail.activityLevel} value={profile.activityLevel ?? t.userDetail.notAvailable} />
            <Field label={t.userDetail.calorieTarget} value={profile.dailyCalorieTarget ? `${profile.dailyCalorieTarget} kcal` : t.userDetail.notAvailable} />
            <Field label={t.userDetail.language} value={profile.language} />
            <Field label={t.userDetail.theme} value={profile.theme} />
          </dl>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.userDetail.accountSection}</AdminCardTitle>
          </AdminCardHeader>
          <dl className="grid grid-cols-2 gap-3 text-[12px]">
            <Field label={t.userDetail.email} value={account.email ?? '—'} />
            <Field label={t.userDetail.telegramId} value={account.telegramId ?? '—'} />
            <Field label={t.userDetail.authProvider} value={account.authProvider} />
            <Field label={t.userDetail.registered} value={new Date(account.createdAt).toLocaleDateString()} />
            <Field label={t.userDetail.lastActive} value={account.lastActiveAt ? new Date(account.lastActiveAt).toLocaleDateString() : t.common.never} />
            <div>
              <div className="text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
                {t.userDetail.status}
              </div>
              <div className="mt-0.5">
                <StatusBadge tone={userStatusToneOf(account.status)} label={account.status} />
              </div>
            </div>
          </dl>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.userDetail.nutritionSection}</AdminCardTitle>
          </AdminCardHeader>
          <dl className="grid grid-cols-2 gap-3 text-[12px]">
            <Field label={t.userDetail.mealsCount} value={fmtNumber(nutrition.mealsCount, lang)} />
            <Field label={t.userDetail.avgCalories} value={`${fmtNumber(nutrition.avgCalories, lang)} kcal`} />
            <Field label={t.userDetail.avgProtein} value={`${fmtNumber(nutrition.avgProtein, lang)} g`} />
            <Field label={t.userDetail.avgCarbs} value={`${fmtNumber(nutrition.avgCarbs, lang)} g`} />
            <Field label={t.userDetail.avgFat} value={`${fmtNumber(nutrition.avgFat, lang)} g`} />
          </dl>
        </AdminCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t.userDetail.calorieHistorySection}</AdminCardTitle>
            </AdminCardHeader>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={calorieHistory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="calorieFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={adminChartColors[0]} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={adminChartColors[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={adminChartGrid} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={{ stroke: adminChartGrid }} />
                  <YAxis tick={{ fontSize: 10, fill: adminChartAxis }} tickLine={false} axisLine={false} width={32} />
                  <Tooltip
                    content={({ active, label, payload }) => (
                      <AdminChartTooltip
                        active={active}
                        label={label}
                        items={payload?.map((p) => ({ name: 'kcal', value: Number(p.value), color: adminChartColors[0] }))}
                      />
                    )}
                  />
                  <Area type="monotone" dataKey="value" stroke={adminChartColors[0]} strokeWidth={2} fill="url(#calorieFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        </div>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.userDetail.aiSection}</AdminCardTitle>
          </AdminCardHeader>
          <dl className="grid grid-cols-1 gap-3 text-[12px]">
            <Field label={t.userDetail.aiRequestCount} value={fmtNumber(aiStats.requestCount, lang)} />
            <Field label={t.userDetail.aiFailedCount} value={fmtNumber(aiStats.failedCount, lang)} />
            <Field
              label={t.userDetail.aiAvgResponseTime}
              value={aiStats.avgResponseTimeMs !== null ? `${fmtNumber(aiStats.avgResponseTimeMs, lang)} ms` : '—'}
            />
          </dl>
        </AdminCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.userDetail.recentMealsSection}</AdminCardTitle>
          </AdminCardHeader>
          {recentMeals.length === 0 ? (
            <p className="py-6 text-center text-[12px]" style={{ color: 'var(--adm-text-3)' }}>
              {t.userDetail.noRecentMeals}
            </p>
          ) : (
            <ul className="flex flex-col">
              {recentMeals.map((meal) => (
                <li key={meal.id} className="flex items-center justify-between gap-2 border-b py-2 text-[12px] last:border-b-0" style={{ borderColor: 'var(--adm-border)' }}>
                  <span style={{ color: 'var(--adm-text)' }}>
                    {meal.emoji ?? ''} {meal.name}
                  </span>
                  <span className="adm-mono" style={{ color: 'var(--adm-text-3)' }}>
                    {meal.calories} kcal
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>{t.userDetail.recentActivitySection}</AdminCardTitle>
          </AdminCardHeader>
          {recentActivity.length === 0 ? (
            <p className="py-6 text-center text-[12px]" style={{ color: 'var(--adm-text-3)' }}>
              {t.userDetail.noRecentActivity}
            </p>
          ) : (
            <ul className="flex flex-col">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-2 border-b py-2 text-[12px] last:border-b-0" style={{ borderColor: 'var(--adm-border)' }}>
                  <span style={{ color: 'var(--adm-text)' }}>{item.label}</span>
                  <span className="adm-mono text-[11px]" style={{ color: 'var(--adm-text-3)' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <UserStatusConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        userId={profile.id}
        nextStatus={nextStatus}
        onSuccess={() => navigate(`/admin/users/${profile.id}`, { replace: true })}
      />
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[10.5px]" style={{ color: 'var(--adm-text-3)' }}>
        {label}
      </div>
      <div className="mt-0.5 font-medium" style={{ color: 'var(--adm-text)' }}>
        {value}
      </div>
    </div>
  )
}

function UserStatusConfirmDialog({
  open,
  onOpenChange,
  userId,
  nextStatus,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  nextStatus: 'ACTIVE' | 'DISABLED'
  onSuccess: () => void
}) {
  const { t } = useAdminTranslation()
  const mutation = useUpdateUserStatus(userId)
  const isDisabling = nextStatus === 'DISABLED'
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isDisabling ? t.users.disableConfirmTitle : t.users.enableConfirmTitle}
      description={isDisabling ? t.users.disableConfirmBody : t.users.enableConfirmBody}
      destructive={isDisabling}
      confirmLabel={isDisabling ? t.users.disableUser : t.users.enableUser}
      loading={mutation.isPending}
      onConfirm={() =>
        mutation.mutate(nextStatus, {
          onSuccess: () => {
            onOpenChange(false)
            onSuccess()
          },
        })
      }
    />
  )
}
