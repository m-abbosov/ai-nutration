import * as SwitchPrimitive from '@radix-ui/react-switch'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/shared/lib/cn'

export function Switch({ className, ...props }: ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'relative h-[23px] w-10 flex-none rounded-full p-[3px] transition-colors data-[state=checked]:bg-acc data-[state=unchecked]:bg-line2',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-[17px] w-[17px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-200 data-[state=checked]:translate-x-[17px] data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  )
}
