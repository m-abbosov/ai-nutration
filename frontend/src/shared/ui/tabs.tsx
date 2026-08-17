import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@nutriai/shared/lib/cn'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex gap-0.5 rounded-[11px] border border-line p-[3px]', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[12px] font-medium text-tx3 transition-colors data-[state=active]:bg-surf2 data-[state=active]:text-tx',
        className,
      )}
      {...props}
    />
  )
}

export const TabsContent = TabsPrimitive.Content
