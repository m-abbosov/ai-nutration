import type { HTMLAttributes } from 'react'
import { cn } from '@nutriai/shared/lib/cn'

export function AdminSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('adm-animate-pulse rounded-[var(--adm-radius-sm)]', className)}
      style={{ background: 'var(--adm-bg-inset)' }}
      {...props}
    />
  )
}

export function KpiGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--adm-radius-lg)] border p-4"
          style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)' }}
        >
          <AdminSkeleton className="h-3 w-16" />
          <AdminSkeleton className="mt-3 h-6 w-20" />
          <AdminSkeleton className="mt-2 h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="rounded-[var(--adm-radius-lg)] border p-4"
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)' }}
    >
      <AdminSkeleton className="h-3 w-32" />
      <AdminSkeleton className="mt-4 w-full" style={{ height }} />
    </div>
  )
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-[var(--adm-radius-lg)] border" style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)' }}>
      <div className="border-b p-3" style={{ borderColor: 'var(--adm-border)' }}>
        <AdminSkeleton className="h-3 w-40" />
      </div>
      <div>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 border-b p-3 last:border-b-0"
            style={{ borderColor: 'var(--adm-border)' }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <AdminSkeleton key={c} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
