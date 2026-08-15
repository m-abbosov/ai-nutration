import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export const AdminDialog = DialogPrimitive.Root
export const AdminDialogTrigger = DialogPrimitive.Trigger
export const AdminDialogClose = DialogPrimitive.Close

export function AdminDialogContent({ className, children, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className="fixed inset-0 z-50 data-[state=open]:animate-[adm-fade_.15s_ease]"
        style={{ background: 'var(--adm-overlay)' }}
      />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[var(--adm-radius-lg)] border p-5 data-[state=open]:animate-[adm-pop_.15s_ease]',
          className,
        )}
        style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-lg)' }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-3 top-3 rounded-[var(--adm-radius-sm)] p-1 transition-colors"
          style={{ color: 'var(--adm-text-3)' }}
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function AdminDialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1 pr-6', className)} {...props} />
}

export function AdminDialogTitle({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-[15px] font-semibold tracking-tight', className)}
      style={{ color: 'var(--adm-text)' }}
      {...props}
    />
  )
}

export function AdminDialogDescription({ className, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-[12.5px] leading-relaxed', className)}
      style={{ color: 'var(--adm-text-2)' }}
      {...props}
    />
  )
}
