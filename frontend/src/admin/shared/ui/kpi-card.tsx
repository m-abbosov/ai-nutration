import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface KpiCardProps {
  label: string
  value: string
  deltaPct: number | null
  /** For metrics where a lower value is the good direction (e.g. error rate). */
  invertTrend?: boolean
  icon?: ReactNode
  index?: number
  compareLabel?: string
}

export function KpiCard({ label, value, deltaPct, invertTrend = false, icon, index = 0, compareLabel }: KpiCardProps) {
  const isUp = (deltaPct ?? 0) > 0
  const isFlat = deltaPct === null || deltaPct === 0
  const isGood = isFlat ? null : invertTrend ? !isUp : isUp
  const tone = isFlat ? 'var(--adm-text-3)' : isGood ? 'var(--adm-good)' : 'var(--adm-critical)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: 'easeOut' }}
      className="rounded-[var(--adm-radius-lg)] border p-4"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-sm)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--adm-text-3)' }}>
          {label}
        </span>
        {icon && (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-[var(--adm-radius-sm)]"
            style={{ background: 'var(--adm-accent-subtle)', color: 'var(--adm-accent)' }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="adm-mono mt-2 text-[22px] font-semibold leading-none tracking-tight" style={{ color: 'var(--adm-text)' }}>
        {value}
      </div>
      <div className={cn('mt-2 flex items-center gap-1 text-[11px] font-medium')} style={{ color: tone }}>
        {isFlat ? <Minus className="h-3 w-3" /> : isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span className="adm-mono">{deltaPct === null ? '—' : `${deltaPct > 0 ? '+' : ''}${deltaPct.toFixed(1)}%`}</span>
        {compareLabel && <span style={{ color: 'var(--adm-text-3)' }}>{compareLabel}</span>}
      </div>
    </motion.div>
  )
}
