import type { HTMLAttributes } from "react";

import { cn } from "@nutriai/shared/lib/cn";

export function AdminCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[var(--adm-radius-lg)] border p-4", className)}
      style={{
        background: "var(--adm-surface)",
        borderColor: "var(--adm-border)",
        boxShadow: "var(--adm-shadow-sm)",
      }}
      {...props}
    />
  );
}

export function AdminCardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 flex items-center justify-between gap-3", className)} {...props} />;
}

export function AdminCardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-[13px] font-semibold tracking-tight", className)} style={{ color: "var(--adm-text)" }} {...props} />;
}

export function AdminCardSubtitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-0.5 text-[11.5px]", className)} style={{ color: "var(--adm-text-3)" }} {...props} />;
}
