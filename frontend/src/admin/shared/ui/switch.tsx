import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/shared/lib/cn'

export function AdminSwitch({ className, ...props }: ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn('relative h-[20px] w-9 flex-none rounded-full p-[2px] transition-colors', className)}
      style={{
        background: props.checked ? 'var(--adm-accent)' : 'var(--adm-border-strong)',
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  )
}
