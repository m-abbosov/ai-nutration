import { useLogout } from "@nutriai/shared/api/auth";
import { useTranslation } from "@nutriai/shared/i18n";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider";

import { useDashboard } from "@/shared/api/dashboard";
import { useMountedTransition } from "@/shared/lib/use-mounted-transition";
import { Skeleton } from "@/shared/ui/skeleton";

import { ProfileHeader } from "@/widgets/profile-header/profile-header";
import { ProfileMetrics } from "@/widgets/profile-metrics/profile-metrics";

import { defaultMacroSplit } from "@/entities/user/lib/helpers";

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const { data: dashboard } = useDashboard();
  const mounted = useMountedTransition();
  const navigate = useNavigate();
  const logout = useLogout();

  const handleSignOut = () => {
    if (!window.confirm(t.app.signOutConfirm)) return;
    logout.mutate(undefined, { onSettled: () => navigate("/login", { replace: true }) });
  };

  if (isLoading || !user) {
    return (
      <div className="px-5 pb-[70px] pt-[22px] md:px-[34px]">
        <Skeleton className="h-[150px] rounded-[22px]" />
      </div>
    );
  }

  const target = user.dailyCalorieTarget ?? 2000;
  const split =
    user.proteinTargetG != null && user.carbsTargetG != null && user.fatTargetG != null
      ? { proteinG: user.proteinTargetG, carbsG: user.carbsTargetG, fatG: user.fatTargetG }
      : defaultMacroSplit(target);
  const splitKcal = { p: split.proteinG * 4, c: split.carbsG * 4, f: split.fatG * 9 };
  const totalKcal = splitKcal.p + splitKcal.c + splitKcal.f || 1;
  const parts = [
    { label: t.mProtein, color: "bg-pro", pct: Math.round((splitKcal.p / totalKcal) * 100), grams: split.proteinG },
    { label: t.mCarbs, color: "bg-carb", pct: Math.round((splitKcal.c / totalKcal) * 100), grams: split.carbsG },
    { label: t.mFat, color: "bg-fat", pct: Math.round((splitKcal.f / totalKcal) * 100), grams: split.fatG },
  ];

  const dayPct = dashboard ? Math.min(100, Math.round((dashboard.daily.consumed / (dashboard.daily.target || 1)) * 100)) : 0;

  return (
    <div className="animate-fu max-w-[1020px] px-5 pb-[70px] pt-[22px] md:px-[34px]">
      <ProfileHeader user={user} streakDays={dashboard?.streakDays ?? 0} dayPct={dayPct} />
      <ProfileMetrics user={user} />

      <section className="mt-[26px]">
        <div className="px-0.5 pb-3 font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.prSplit}</div>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
          {parts.map((p) => (
            <div
              key={p.label}
              className={`${p.color} rounded-full transition-[width] duration-1000`}
              style={{ width: mounted ? `${p.pct}%` : "0%" }}
            />
          ))}
        </div>
        <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3.5">
          {parts.map((p) => (
            <div key={p.label} className="flex items-center gap-2.5">
              <span className={`h-2 w-2 flex-none rounded-[3px] ${p.color}`} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-tx2">{p.label}</span>
              <span className="font-mono text-[11.5px]">
                <span className="text-tx">
                  {p.grams} {t.g}
                </span>
                <span className="text-tx3"> · {p.pct}%</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-[26px]">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-[18px] border border-line bg-surf px-[18px] py-[15px] text-left transition-colors hover:bg-surfH"
        >
          <span className="flex-1 text-[13.5px] font-medium text-fat">{t.stOut}</span>
          <span className="font-mono text-[11px] text-tx3">→</span>
        </button>
      </section>
    </div>
  );
}
