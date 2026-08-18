import type { UserDto } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";

import { useUpdateMe } from "@/shared/api/users";
import { Switch } from "@/shared/ui/switch";

/** Toggles persist as user preference flags (UI-only in Phase 1 — no push/email/
 * Telegram delivery yet, per DESIGN_MAPPING.md). */
export function SettingsNotifications({ user }: { user: UserDto }) {
  const { t } = useTranslation();
  const updateMe = useUpdateMe();

  const rows: { key: "notifyDaily" | "notifyWeekly" | "notifyAiTips"; title: string; sub: string }[] = [
    { key: "notifyDaily", title: t.stN1, sub: t.stN1s },
    { key: "notifyWeekly", title: t.stN2, sub: t.stN2s },
    { key: "notifyAiTips", title: t.stN3, sub: t.stN3s },
  ];

  return (
    <>
      <div className="mt-6 pb-[11px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.stNotif}</div>
      <div className="flex flex-col gap-px overflow-hidden rounded-[18px] border border-line bg-line">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-4 bg-surf px-[18px] py-[15px]">
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium">{r.title}</div>
              <div className="mt-0.5 text-[12px] text-tx3">{r.sub}</div>
            </div>
            <Switch checked={user[r.key]} onCheckedChange={(checked) => updateMe.mutate({ [r.key]: checked })} />
          </div>
        ))}
      </div>
    </>
  );
}
