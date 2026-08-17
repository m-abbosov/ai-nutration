import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@nutriai/shared/lib/cn'

export const AdminInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-8 w-full rounded-[var(--adm-radius-sm)] border px-2.5 text-[12.5px] outline-none transition-colors placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-accent)] disabled:opacity-50',
        className,
      )}
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border-strong)', color: 'var(--adm-text)', ...style }}
      {...props}
    />
  ),
)
AdminInput.displayName = 'AdminInput'
