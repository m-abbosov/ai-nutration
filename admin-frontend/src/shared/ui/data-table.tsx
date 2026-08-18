import type { ReactNode } from "react";

import { cn } from "@nutriai/shared/lib/cn";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { AdminButton } from "@/shared/ui/button";
import { TableSkeleton } from "@/shared/ui/skeleton";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  align?: "left" | "right" | "center";
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  total,
  page,
  pageSize,
  onPageChange,
  sortBy,
  sortDir,
  onSortChange,
  loading,
  onRowClick,
  emptyState,
  rowHref,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (key: string) => void;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyState: ReactNode;
  rowHref?: (row: T) => string | undefined;
}) {
  const { t } = useAdminTranslation();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (loading && rows.length === 0) return <TableSkeleton cols={columns.length} />;

  if (!loading && rows.length === 0) {
    return (
      <div className="rounded-[var(--adm-radius-lg)] border" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}>
        <div className="p-8">{emptyState}</div>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--adm-radius-lg)] border" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--adm-border)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                    col.sortable && "cursor-pointer select-none",
                  )}
                  style={{ color: "var(--adm-text-3)" }}
                  onClick={() => col.sortable && onSortChange?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable &&
                      (sortBy === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href = rowHref?.(row);
              const clickable = !!onRowClick || !!href;
              return (
                <tr
                  key={getRowId(row)}
                  className={cn("border-b last:border-b-0 transition-colors", clickable && "cursor-pointer")}
                  style={{ borderColor: "var(--adm-border)" }}
                  onMouseEnter={(e) => clickable && (e.currentTarget.style.background = "var(--adm-surface-hover)")}
                  onMouseLeave={(e) => clickable && (e.currentTarget.style.background = "transparent")}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-3 py-2.5",
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                        col.className,
                      )}
                      style={{ color: "var(--adm-text)" }}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5 text-[11.5px]"
        style={{ borderColor: "var(--adm-border)", color: "var(--adm-text-3)" }}
      >
        <span>
          {t.common.total}: <span className="adm-mono">{total}</span>
        </span>
        <div className="flex items-center gap-2">
          <AdminButton variant="ghost" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </AdminButton>
          <span className="adm-mono">
            {t.common.page} {page} {t.common.of} {pageCount}
          </span>
          <AdminButton variant="ghost" size="icon" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
