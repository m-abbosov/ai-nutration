import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AdminCard, AdminCardHeader, AdminCardSubtitle, AdminCardTitle } from '@/shared/ui/card'

/** Validated 8-hue categorical chart palette (dataviz skill reference
 * palette) — read as CSS custom properties so series colors swap themes
 * live without a re-render. Use in a fixed order; never cycle/reassign. */
export const adminChartColors = [
  'var(--adm-chart-1)',
  'var(--adm-chart-2)',
  'var(--adm-chart-3)',
  'var(--adm-chart-4)',
  'var(--adm-chart-5)',
  'var(--adm-chart-6)',
  'var(--adm-chart-7)',
  'var(--adm-chart-8)',
]

export const adminChartGrid = 'var(--adm-chart-grid)'
export const adminChartAxis = 'var(--adm-chart-axis)'

export function AdminChartCard({
  title,
  subtitle,
  actions,
  children,
  height = 260,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  height?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
      <AdminCard>
        <AdminCardHeader>
          <div>
            <AdminCardTitle>{title}</AdminCardTitle>
            {subtitle && <AdminCardSubtitle>{subtitle}</AdminCardSubtitle>}
          </div>
          {actions}
        </AdminCardHeader>
        <div style={{ height }}>{children}</div>
      </AdminCard>
    </motion.div>
  )
}

/** Tooltip content with guaranteed real contrast in both themes (dark bg +
 * light text in light mode, elevated surface + light text in dark mode —
 * never theme-matched to the point of black-on-black/white-on-white). */
export function AdminChartTooltip({
  active,
  label,
  formatValue,
  items,
}: {
  active?: boolean
  label?: string
  formatValue?: (v: number) => string
  items?: { name: string; value: number; color: string }[]
}) {
  if (!active || !items || items.length === 0) return null
  return (
    <div
      className="rounded-[var(--adm-radius-md)] border px-3 py-2 text-[11.5px] shadow-lg"
      style={{ background: 'var(--adm-tooltip-bg)', color: 'var(--adm-tooltip-text)', borderColor: 'var(--adm-tooltip-border)' }}
    >
      {label && <div className="mb-1 font-medium opacity-80">{label}</div>}
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="h-2 w-2 flex-none rounded-full" style={{ background: item.color }} />
            <span className="flex-1 opacity-90">{item.name}</span>
            <span className="adm-mono font-medium">{formatValue ? formatValue(item.value) : item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
