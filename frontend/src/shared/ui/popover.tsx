import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@nutriai/shared/lib/cn";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export function PopoverContent({
  className,
  children,
  sideOffset = 8,
  align = "start",
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn("z-50 animate-fu rounded-[15px] border border-line2 bg-surf2 p-3 shadow-card outline-none", className)}
        sideOffset={sideOffset}
        align={align}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
