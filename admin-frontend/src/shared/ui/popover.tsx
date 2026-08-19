import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@nutriai/shared/lib/cn";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export const AdminPopover = PopoverPrimitive.Root;
export const AdminPopoverTrigger = PopoverPrimitive.Trigger;

export function AdminPopoverContent({
  className,
  children,
  sideOffset = 6,
  align = "start",
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn(
          "z-50 rounded-[var(--adm-radius-md)] border p-2.5 outline-none data-[state=closed]:animate-[adm-fade-out_.1s_ease] data-[state=open]:animate-[adm-fade_.12s_ease]",
          className,
        )}
        style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)", boxShadow: "var(--adm-shadow-lg)" }}
        sideOffset={sideOffset}
        align={align}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
