import * as SelectPrimitive from '@radix-ui/react-select'
import type { ComponentPropsWithoutRef } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@nutriai/shared/lib/cn'

export const AdminSelect = SelectPrimitive.Root
export const AdminSelectValue = SelectPrimitive.Value

export function AdminSelectTrigger({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-8 items-center justify-between gap-2 whitespace-nowrap rounded-[var(--adm-radius-sm)] border px-2.5 text-[12.5px] outline-none transition-colors',
        className,
      )}
      style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border-strong)', color: 'var(--adm-text)' }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function AdminSelectContent({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn('z-50 overflow-hidden rounded-[var(--adm-radius-md)] border p-1', className)}
        style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-lg)' }}
        position="popper"
        sideOffset={4}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function AdminSelectItem({ className, children, ...props }: ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-[var(--adm-radius-sm)] px-2.5 py-1.5 text-[12.5px] outline-none data-[highlighted]:bg-[var(--adm-surface-hover)]',
        className,
      )}
      style={{ color: 'var(--adm-text)' }}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto">
        <Check className="h-3.5 w-3.5" style={{ color: 'var(--adm-accent)' }} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
