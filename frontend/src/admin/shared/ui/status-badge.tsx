import type { ReactNode } from 'react'
import { AlertTriangle, Circle, CircleCheck, CircleHelp, CircleX } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type StatusTone = 'good' | 'warning' | 'critical' | 'neutral' | 'info'

const toneStyle: Record<StatusTone, { bg: string; fg: string }> = {
  good: { bg: 'var(--adm-good-subtle)', fg: 'var(--adm-good)' },
  warning: { bg: 'var(--adm-warning-subtle)', fg: 'var(--adm-warning)' },
  critical: { bg: 'var(--adm-critical-subtle)', fg: 'var(--adm-critical)' },
  neutral: { bg: 'var(--adm-neutral-subtle)', fg: 'var(--adm-text-2)' },
  info: { bg: 'var(--adm-accent-subtle)', fg: 'var(--adm-accent)' },
}

const toneIcon: Record<StatusTone, ReactNode> = {
  good: <CircleCheck className="h-3 w-3" />,
  warning: <AlertTriangle className="h-3 w-3" />,
  critical: <CircleX className="h-3 w-3" />,
  neutral: <Circle className="h-3 w-3" />,
  info: <CircleHelp className="h-3 w-3" />,
}

export function StatusBadge({
  tone,
  label,
  withIcon = true,
  className,
}: {
  tone: StatusTone
  label: string
  withIcon?: boolean
  className?: string
}) {
  const s = toneStyle[tone]
  return (
    <span
      className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium', className)}
      style={{ background: s.bg, color: s.fg }}
    >
      {withIcon && toneIcon[tone]}
      {label}
    </span>
  )
}

export function healthToneOf(status: 'HEALTHY' | 'WARNING' | 'ERROR' | 'UNKNOWN'): StatusTone {
  if (status === 'HEALTHY') return 'good'
  if (status === 'WARNING') return 'warning'
  if (status === 'ERROR') return 'critical'
  return 'neutral'
}

export function userStatusToneOf(status: 'ACTIVE' | 'DISABLED'): StatusTone {
  return status === 'ACTIVE' ? 'good' : 'critical'
}

export function aiStatusToneOf(status: 'SUCCESS' | 'ERROR'): StatusTone {
  return status === 'SUCCESS' ? 'good' : 'critical'
}

export function severityToneOf(severity: 'INFO' | 'WARNING' | 'ERROR'): StatusTone {
  if (severity === 'INFO') return 'info'
  if (severity === 'WARNING') return 'warning'
  return 'critical'
}
