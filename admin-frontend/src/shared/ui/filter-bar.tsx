import type { ReactNode } from "react";

import { Search, X } from "lucide-react";

import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { AdminButton } from "@/shared/ui/button";
import { AdminInput } from "@/shared/ui/input";

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  children,
  onClear,
  hasActiveFilters,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  onClear?: () => void;
  hasActiveFilters?: boolean;
}) {
  const { t } = useAdminTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSearchChange && (
        <div className="relative w-full max-w-[260px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--adm-text-3)" }} />
          <AdminInput
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder ?? t.common.search}
            className="pl-8"
          />
        </div>
      )}
      {children}
      {hasActiveFilters && onClear && (
        <AdminButton variant="ghost" size="sm" onClick={onClear}>
          <X className="h-3 w-3" />
          {t.common.clearFilters}
        </AdminButton>
      )}
    </div>
  );
}
