import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@nutriai/shared/lib/cn";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border border-line2 bg-surf2 px-3.5 py-2.5 text-[13px] outline-none transition-colors hover:border-acc",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectScrollButton({
  className,
  Comp,
  Icon,
}: {
  className?: string;
  Comp: typeof SelectPrimitive.ScrollUpButton | typeof SelectPrimitive.ScrollDownButton;
  Icon: typeof ChevronUp;
}) {
  return (
    <Comp className={cn("flex h-5 cursor-default items-center justify-center text-tx3", className)}>
      <Icon className="h-3.5 w-3.5" />
    </Comp>
  );
}

export function SelectContent({ className, children, ...props }: ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn("z-50 overflow-hidden rounded-[13px] border border-line2 bg-surf2 p-1.5 shadow-card animate-fu", className)}
        position="popper"
        sideOffset={6}
        {...props}
      >
        <SelectScrollButton Comp={SelectPrimitive.ScrollUpButton} Icon={ChevronUp} />
        <SelectPrimitive.Viewport className="max-h-[var(--radix-select-content-available-height)] overflow-y-auto">
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollButton Comp={SelectPrimitive.ScrollDownButton} Icon={ChevronDown} />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-[9px] px-2.5 py-2 text-[13px] outline-none hover:bg-surfH data-[state=checked]:text-acc",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto">
        <Check className="h-3.5 w-3.5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
