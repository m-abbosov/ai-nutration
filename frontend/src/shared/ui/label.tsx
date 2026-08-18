import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@nutriai/shared/lib/cn";
import * as LabelPrimitive from "@radix-ui/react-label";

export function Label({ className, ...props }: ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("block font-mono text-[9.5px] font-medium uppercase tracking-[.16em] text-tx3 mb-1.5", className)}
      {...props}
    />
  );
}
