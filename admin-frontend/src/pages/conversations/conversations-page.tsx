import { useState } from "react";

import { fmtNumber } from "@nutriai/shared/lib/format";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAdminConversations } from "@/shared/api/conversations";
import type { AdminConversationListItemDto } from "@/shared/api/types";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { usePermission } from "@/shared/rbac/admin-auth-context";
import { AdminHeader } from "@/shared/ui/admin-header";
import { DataTable, type DataTableColumn } from "@/shared/ui/data-table";
import { AdminEmptyState, AdminErrorState } from "@/shared/ui/error-state";
import { FilterBar } from "@/shared/ui/filter-bar";

const PAGE_SIZE = 20;

export function ConversationsPage() {
  const { t, lang } = useAdminTranslation();
  const navigate = useNavigate();
  const canReadContent = usePermission("CONVERSATIONS_READ");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useAdminConversations({ page, pageSize: PAGE_SIZE, search: search || undefined });

  const columns: DataTableColumn<AdminConversationListItemDto>[] = [
    { key: "userName", header: t.conversations.colUser, render: (row) => <span className="font-medium">{row.userName}</span> },
    {
      key: "title",
      header: t.conversations.colTitle,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          {row.title}
          {!canReadContent && <Lock className="h-3 w-3" style={{ color: "var(--adm-text-3)" }} />}
        </span>
      ),
    },
    {
      key: "messageCount",
      header: t.conversations.colMessages,
      align: "right",
      render: (row) => <span className="adm-mono">{fmtNumber(row.messageCount, lang)}</span>,
    },
    {
      key: "createdAt",
      header: t.conversations.colCreated,
      render: (row) => <span className="adm-mono text-[11.5px]">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "updatedAt",
      header: t.conversations.colUpdated,
      render: (row) => <span className="adm-mono text-[11.5px]">{new Date(row.updatedAt).toLocaleDateString()}</span>,
    },
  ];

  return (
    <div>
      <AdminHeader title={t.conversations.title} subtitle={t.conversations.subtitle} />

      <div className="mb-4">
        <FilterBar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={t.conversations.searchPlaceholder}
        />
      </div>

      {isError ? (
        <AdminErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          getRowId={(row) => row.id}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={isLoading}
          onRowClick={canReadContent ? (row) => navigate(`/conversations/${row.id}`) : undefined}
          emptyState={<AdminEmptyState message={t.emptyStates.noConversations} />}
        />
      )}
      {!canReadContent && (
        <p className="mt-2 text-[11px]" style={{ color: "var(--adm-text-3)" }}>
          {t.conversations.lockedTooltip}
        </p>
      )}
    </div>
  );
}
