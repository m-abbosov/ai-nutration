import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  width = 480,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: number
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 data-[state=open]:animate-[adm-fade_.15s_ease]"
          style={{ background: 'var(--adm-overlay)' }}
        />
        <DialogPrimitive.Content
          className="fixed right-0 top-0 z-50 h-full max-w-[92vw] overflow-y-auto border-l data-[state=open]:animate-[adm-slide-in-right_.2s_ease]"
          style={{ width, background: 'var(--adm-surface)', borderColor: 'var(--adm-border)', boxShadow: 'var(--adm-shadow-lg)' }}
        >
          <div
            className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b px-5 py-4"
            style={{ background: 'var(--adm-surface)', borderColor: 'var(--adm-border)' }}
          >
            <div>
              <DialogPrimitive.Title className="text-[15px] font-semibold" style={{ color: 'var(--adm-text)' }}>
                {title}
              </DialogPrimitive.Title>
              {subtitle && (
                <DialogPrimitive.Description className="mt-0.5 text-[11.5px]" style={{ color: 'var(--adm-text-3)' }}>
                  {subtitle}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close
              className="flex h-7 w-7 flex-none items-center justify-center rounded-[var(--adm-radius-sm)]"
              style={{ color: 'var(--adm-text-3)' }}
            >
              <X className="h-4 w-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="p-5">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
