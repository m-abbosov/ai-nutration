import type { HTMLAttributes } from 'react'
import { cn } from '@nutriai/shared/lib/cn'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accT px-2.5 py-1 text-[11px] font-medium text-acc',
        className,
      )}
      {...props}
    />
  )
}
