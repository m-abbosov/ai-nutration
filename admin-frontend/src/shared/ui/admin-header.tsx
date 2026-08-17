import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface Breadcrumb {
  label: string
  to?: string
}

export function AdminHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="mb-1 flex items-center gap-1 text-[11.5px]" style={{ color: 'var(--adm-text-3)' }}>
            {breadcrumbs.map((bc, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {bc.to ? (
                  <Link to={bc.to} className="transition-colors hover:opacity-80" style={{ color: 'var(--adm-text-3)' }}>
                    {bc.label}
                  </Link>
                ) : (
                  <span>{bc.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="text-[19px] font-semibold tracking-tight" style={{ color: 'var(--adm-text)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--adm-text-2)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-none items-center gap-2">{actions}</div>}
    </div>
  )
}
