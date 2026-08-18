import { useState } from "react";

import { usePromoteToAdmin } from "@/shared/api/admin-team";
import type { AdminRoleName } from "@/shared/api/types";
import { useAdminUsers } from "@/shared/api/users";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { AdminButton } from "@/shared/ui/button";
import { AdminDialog, AdminDialogContent, AdminDialogDescription, AdminDialogHeader, AdminDialogTitle } from "@/shared/ui/dialog";
import { AdminInput } from "@/shared/ui/input";
import { AdminSelect, AdminSelectContent, AdminSelectItem, AdminSelectTrigger, AdminSelectValue } from "@/shared/ui/select";

const ROLES: AdminRoleName[] = ["SUPER_ADMIN", "ADMIN", "MODERATOR", "SUPPORT"];

export function PromoteUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useAdminTranslation();
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [role, setRole] = useState<AdminRoleName>("SUPPORT");

  const usersQuery = useAdminUsers({ page: 1, pageSize: 8, search: search || undefined });
  const promote = usePromoteToAdmin();

  const close = () => {
    onOpenChange(false);
    setSearch("");
    setSelectedUserId(null);
    setRole("SUPPORT");
  };

  return (
    <AdminDialog open={open} onOpenChange={(v) => !v && close()}>
      <AdminDialogContent>
        <AdminDialogHeader>
          <AdminDialogTitle>{t.adminUsers.promoteTitle}</AdminDialogTitle>
          <AdminDialogDescription>{t.adminUsers.promoteNoResults}</AdminDialogDescription>
        </AdminDialogHeader>

        <div className="flex flex-col gap-3">
          <AdminInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedUserId(null);
            }}
            placeholder={t.adminUsers.promoteSearchPlaceholder}
          />

          <div className="max-h-[180px] overflow-y-auto rounded-[var(--adm-radius-md)] border" style={{ borderColor: "var(--adm-border)" }}>
            {search && (usersQuery.data?.items.length ?? 0) === 0 ? (
              <p className="p-3 text-center text-[11.5px]" style={{ color: "var(--adm-text-3)" }}>
                {t.adminUsers.promoteNoResults}
              </p>
            ) : (
              (usersQuery.data?.items ?? []).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedUserId(u.id)}
                  className="flex w-full items-center justify-between gap-2 border-b px-2.5 py-2 text-left text-[12px] last:border-b-0"
                  style={{
                    borderColor: "var(--adm-border)",
                    background: selectedUserId === u.id ? "var(--adm-accent-subtle)" : "transparent",
                  }}
                >
                  <span>
                    <span className="font-medium" style={{ color: "var(--adm-text)" }}>
                      {u.name}
                    </span>
                    <span className="ml-1.5" style={{ color: "var(--adm-text-3)" }}>
                      {u.email}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div>
            <div className="mb-1 text-[11px]" style={{ color: "var(--adm-text-3)" }}>
              {t.adminUsers.promoteRole}
            </div>
            <AdminSelect value={role} onValueChange={(v) => setRole(v as AdminRoleName)}>
              <AdminSelectTrigger className="w-full">
                <AdminSelectValue />
              </AdminSelectTrigger>
              <AdminSelectContent>
                {ROLES.map((r) => (
                  <AdminSelectItem key={r} value={r}>
                    {r}
                  </AdminSelectItem>
                ))}
              </AdminSelectContent>
            </AdminSelect>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <AdminButton variant="secondary" size="sm" onClick={close}>
            {t.common.cancel}
          </AdminButton>
          <AdminButton
            size="sm"
            disabled={!selectedUserId || promote.isPending}
            onClick={() => selectedUserId && promote.mutate({ userId: selectedUserId, role }, { onSuccess: close })}
          >
            {t.adminUsers.promoteSubmit}
          </AdminButton>
        </div>
      </AdminDialogContent>
    </AdminDialog>
  );
}
