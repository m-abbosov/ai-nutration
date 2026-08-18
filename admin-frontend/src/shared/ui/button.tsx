import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@nutriai/shared/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

const adminButtonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--adm-radius-sm)] text-[12.5px] font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2",
  {
    variants: {
      variant: {
        primary: "bg-[var(--adm-accent)] text-[var(--adm-text-on-accent)] hover:bg-[var(--adm-accent-hover)]",
        secondary: "border border-[var(--adm-border-strong)] bg-[var(--adm-surface)] text-[var(--adm-text)] hover:bg-[var(--adm-surface-hover)]",
        ghost: "text-[var(--adm-text-2)] hover:bg-[var(--adm-surface-hover)] hover:text-[var(--adm-text)]",
        destructive: "bg-[var(--adm-critical)] text-white hover:brightness-95",
        outlineDestructive: "border border-[var(--adm-critical)] text-[var(--adm-critical)] hover:bg-[var(--adm-critical-subtle)]",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 px-2.5 text-[12px]",
        lg: "h-9 px-4",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof adminButtonVariants> {
  asChild?: boolean;
}

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(({ className, variant, size, asChild, style, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(adminButtonVariants({ variant, size }), className)}
      style={{ ["--tw-ring-color" as string]: "var(--adm-focus-ring)", ...style }}
      {...props}
    />
  );
});
AdminButton.displayName = "AdminButton";
