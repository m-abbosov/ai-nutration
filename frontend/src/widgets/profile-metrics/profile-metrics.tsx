import type { UserDto } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { fmtDecimal, fmtNumber } from "@nutriai/shared/lib/format";

import { GOAL_WEEKLY_RATE_KG, bmi } from "@/entities/user/lib/helpers";

export function ProfileMetrics({ user }: { user: UserDto }) {
  const { t, lang } = useTranslation();
  const bmiValue = bmi(user.weightKg, user.heightCm);

  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      <section>
        <div className="px-0.5 pb-[11px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.prBody}</div>
        <div className="flex flex-col gap-px overflow-hidden rounded-[18px] border border-line bg-line">
          <Row label={t.prAge} value={user.age != null ? `${user.age} ${t.prYears}` : "—"} />
          <Row label={t.prHeight} value={user.heightCm != null ? `${user.heightCm} cm` : "—"} />
          <Row label={t.prWeight} value={user.weightKg != null ? `${fmtDecimal(user.weightKg, lang)} ${t.pgKg}` : "—"} />
          <Row label={t.prBmi} value={bmiValue != null ? fmtDecimal(bmiValue, lang) : "—"} />
        </div>
      </section>
      <section>
        <div className="px-0.5 pb-[11px] font-mono text-[9.5px] tracking-[.16em] text-tx3">{t.prGoals}</div>
        <div className="flex flex-col gap-px overflow-hidden rounded-[18px] border border-line bg-line">
          <Row label={t.prGoal} value={user.goal ? t.goalLabel[user.goal] : "—"} />
          <Row label={t.prAct} value={user.activityLevel ? t.activityLabel[user.activityLevel] : "—"} />
          <Row label={t.prRate} value={user.goal ? `${fmtDecimal(GOAL_WEEKLY_RATE_KG[user.goal], lang)} ${t.pgKg} / ${t.app.perWeek}` : "—"} />
          <div className="flex items-center gap-3 bg-surf px-[17px] py-4">
            <span className="min-w-0 flex-1 text-[13px] text-tx2">{t.prTarget}</span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[22px] font-medium tracking-[-.025em] text-acc tabular-nums">
                {user.dailyCalorieTarget != null ? fmtNumber(user.dailyCalorieTarget, lang) : "—"}
              </span>
              <span className="text-[11.5px] text-tx3">{t.kcal}</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-surf px-[17px] py-3.5">
      <span className="flex-1 text-[13px] text-tx2">{label}</span>
      <span className="text-[14px] font-medium tabular-nums">{value}</span>
    </div>
  );
}
