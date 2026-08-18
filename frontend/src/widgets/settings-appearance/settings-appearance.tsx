import type { Theme } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";

import { useAuth } from "@/app/providers/auth-provider";
import { useThemeContext } from "@/app/providers/theme-provider";

import { useUpdateMe } from "@/shared/api/users";

import { LanguageSwitchSelect } from "@/features/language-switch/language-switch";

export function SettingsAppearance() {
  const { t } = useTranslation();
  const { theme, setTheme } = useThemeContext();
  const { isAuthenticated } = useAuth();
  const updateMe = useUpdateMe();

  const choose = (next: Theme) => {
    setTheme(next);
    if (isAuthenticated) updateMe.mutate({ theme: next });
  };

  return (
    <>
      <div className="mt-7 pb-[11px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.stAppear}</div>
      <div className="flex flex-col gap-px overflow-hidden rounded-[18px] border border-line bg-line">
        <div className="flex flex-wrap items-center gap-4 bg-surf px-[18px] py-4">
          <div className="min-w-[170px] flex-1">
            <div className="text-[13.5px] font-medium">{t.stTheme}</div>
            <div className="mt-0.5 text-[12px] text-tx3">{t.stThemeSub}</div>
          </div>
          <div className="flex gap-[3px] rounded-[11px] border border-line2 p-[3px]">
            <button
              onClick={() => choose("LIGHT")}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                theme === "LIGHT" ? "bg-surf2 text-tx" : "text-tx3",
              )}
            >
              <span className="h-[11px] w-[11px] rounded-full border border-line2" style={{ background: "#f3f1ec" }} />
              {t.stLight}
            </button>
            <button
              onClick={() => choose("DARK")}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                theme === "DARK" ? "bg-surf2 text-tx" : "text-tx3",
              )}
            >
              <span className="h-[11px] w-[11px] rounded-full border border-line2" style={{ background: "#141716" }} />
              {t.stDark}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-surf px-[18px] py-4">
          <div className="min-w-[170px] flex-1">
            <div className="text-[13.5px] font-medium">{t.stLangT}</div>
            <div className="mt-0.5 text-[12px] text-tx3">{t.stLangSub}</div>
          </div>
          <LanguageSwitchSelect />
        </div>
      </div>
    </>
  );
}
