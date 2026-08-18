import { useAdminSettings, useToggleFeatureFlag } from "@/shared/api/settings";
import { useAdminTranslation } from "@/shared/i18n/use-admin-translation";
import { IfPermission } from "@/shared/rbac/admin-auth-context";
import { AdminHeader } from "@/shared/ui/admin-header";
import { AdminCard, AdminCardHeader, AdminCardSubtitle, AdminCardTitle } from "@/shared/ui/card";
import { AdminEmptyState, AdminErrorState } from "@/shared/ui/error-state";
import { AdminSkeleton } from "@/shared/ui/skeleton";
import { AdminSwitch } from "@/shared/ui/switch";

export function SettingsPage() {
  const { t } = useAdminTranslation();
  const { data, isLoading, isError, refetch } = useAdminSettings();
  const toggleFlag = useToggleFeatureFlag();

  return (
    <div>
      <AdminHeader title={t.settings.title} subtitle={t.settings.subtitle} />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <AdminSkeleton className="h-32 w-full" />
          <AdminSkeleton className="h-40 w-full" />
        </div>
      )}

      {isError && !isLoading && <AdminErrorState onRetry={() => refetch()} />}

      {data && (
        <div className="flex flex-col gap-4">
          <AdminCard>
            <AdminCardHeader>
              <div>
                <AdminCardTitle>{t.settings.generalSection}</AdminCardTitle>
                <AdminCardSubtitle>{t.settings.readOnlyNote}</AdminCardSubtitle>
              </div>
            </AdminCardHeader>
            <dl className="grid grid-cols-1 gap-3 text-[12px] sm:grid-cols-3">
              <Field label={t.settings.appName} value={data.general.appName} />
              <Field label={t.settings.defaultLanguage} value={data.general.defaultLanguage} />
              <Field label={t.settings.defaultTimezone} value={data.general.defaultTimezone} />
            </dl>
          </AdminCard>

          <AdminCard>
            <AdminCardHeader>
              <div>
                <AdminCardTitle>{t.settings.aiSection}</AdminCardTitle>
                <AdminCardSubtitle>{t.settings.aiModelsNote}</AdminCardSubtitle>
              </div>
            </AdminCardHeader>
            <div className="flex flex-wrap gap-2">
              {data.ai.enabledModels.map((m) => (
                <span
                  key={`${m.provider}-${m.model}`}
                  className="adm-mono rounded-full px-2.5 py-1 text-[11px] font-medium"
                  style={{ background: "var(--adm-neutral-subtle)", color: "var(--adm-text-2)" }}
                >
                  {m.provider}: {m.model}
                </span>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t.settings.featureFlagsSection}</AdminCardTitle>
            </AdminCardHeader>
            {data.featureFlags.length === 0 ? (
              <AdminEmptyState message={t.settings.noFlags} />
            ) : (
              <ul className="flex flex-col">
                {data.featureFlags.map((flag) => (
                  <li
                    key={flag.key}
                    className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0"
                    style={{ borderColor: "var(--adm-border)" }}
                  >
                    <div>
                      <div className="adm-mono text-[12.5px] font-medium" style={{ color: "var(--adm-text)" }}>
                        {flag.key}
                      </div>
                      {flag.description && (
                        <div className="mt-0.5 text-[11px]" style={{ color: "var(--adm-text-3)" }}>
                          {flag.description}
                        </div>
                      )}
                      <div className="mt-0.5 text-[10px]" style={{ color: "var(--adm-text-3)" }}>
                        {t.settings.flagUpdated}: {new Date(flag.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <IfPermission
                      permission="SETTINGS_MANAGE"
                      fallback={
                        <span className="text-[11px]" style={{ color: flag.enabled ? "var(--adm-good)" : "var(--adm-text-3)" }}>
                          {flag.enabled ? t.common.enabled : t.common.disabled}
                        </span>
                      }
                    >
                      <AdminSwitch
                        checked={flag.enabled}
                        onCheckedChange={(checked) => toggleFlag.mutate({ key: flag.key, enabled: checked })}
                        disabled={toggleFlag.isPending}
                      />
                    </IfPermission>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10.5px]" style={{ color: "var(--adm-text-3)" }}>
        {label}
      </div>
      <div className="mt-0.5 font-medium" style={{ color: "var(--adm-text)" }}>
        {value}
      </div>
    </div>
  );
}
