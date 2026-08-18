import { useMemo } from "react";

import type { NutritionDailyDto } from "@nutriai/shared/api/types";
import { useTranslation } from "@nutriai/shared/i18n";
import { clamp, fmtNumber } from "@nutriai/shared/lib/format";

import { useCountUp } from "@/shared/lib/use-count-up";
import { useMountedTransition } from "@/shared/lib/use-mounted-transition";

const R = 92;
const CIRCUMFERENCE = 2 * Math.PI * R; // 578.05

function buildTicks(pct: number) {
  const ticks = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
    const active = i / 48 <= pct / 100;
    const r1 = 108;
    const r2 = active ? 116 : 113;
    ticks.push({
      x1: (120 + Math.cos(a) * r1).toFixed(1),
      y1: (120 + Math.sin(a) * r1).toFixed(1),
      x2: (120 + Math.cos(a) * r2).toFixed(1),
      y2: (120 + Math.sin(a) * r2).toFixed(1),
      active,
    });
  }
  return ticks;
}

export function DashboardHero({ daily, streakDays }: { daily: NutritionDailyDto; streakDays: number }) {
  const { t, lang } = useTranslation();
  const mounted = useMountedTransition();
  const pct = clamp(Math.round((daily.consumed / (daily.target || 1)) * 100), 0, 999);
  const ringPct = clamp(pct, 0, 100);
  const eatenAnim = useCountUp(daily.consumed);
  const ticks = useMemo(() => buildTicks(ringPct), [ringPct]);
  const mealTypesLogged = new Set(daily.meals.map((m) => m.mealType)).size;

  const dayFlowDots = useMemo(() => {
    // Position each meal along a 06:00-24:00 day-flow bar by its logged hour.
    const startHour = 6;
    const endHour = 24;
    return daily.meals.map((m) => {
      const hour = new Date(m.createdAt).getHours() + new Date(m.createdAt).getMinutes() / 60;
      const clamped = clamp(hour, startHour, endHour);
      const left = ((clamped - startHour) / (endHour - startHour)) * 100;
      return { id: m.id, left: `${left.toFixed(1)}%` };
    });
  }, [daily.meals]);

  return (
    <section className="relative overflow-hidden rounded-[26px] p-6 pt-[34px] md:p-[30px] md:pt-[34px]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 22% 12%, var(--accT), transparent 62%)" }}
      />
      <div className="relative flex flex-wrap items-center gap-9">
        <div className="relative mx-auto h-[220px] w-[220px] flex-none md:h-[262px] md:w-[262px]">
          <div
            className="absolute inset-[14%] animate-halo rounded-full blur-[26px]"
            style={{ background: "radial-gradient(circle, var(--accG), transparent 68%)" }}
          />
          <svg viewBox="0 0 240 240" className="relative block h-full w-full">
            <defs>
              <linearGradient id="ringG" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="var(--accD)" />
                <stop offset=".6" stopColor="var(--acc)" />
                <stop offset="1" stopColor="var(--acc)" />
              </linearGradient>
            </defs>
            <g>
              {ticks.map((k, i) => (
                <line
                  key={i}
                  x1={k.x1}
                  y1={k.y1}
                  x2={k.x2}
                  y2={k.y2}
                  stroke={k.active ? "var(--acc)" : "var(--line2)"}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              ))}
            </g>
            <circle cx="120" cy="120" r={R} fill="none" stroke="var(--line2)" strokeWidth="11" opacity=".55" />
            <circle
              cx="120"
              cy="120"
              r={R}
              fill="none"
              stroke="url(#ringG)"
              strokeWidth="11"
              strokeLinecap="round"
              transform="rotate(-90 120 120)"
              strokeDasharray={CIRCUMFERENCE.toFixed(2)}
              strokeDashoffset={mounted ? (CIRCUMFERENCE * (1 - ringPct / 100)).toFixed(2) : CIRCUMFERENCE.toFixed(2)}
              style={{
                transition: "stroke-dashoffset 1.5s cubic-bezier(.16,.84,.24,1)",
                filter: "drop-shadow(0 0 9px var(--accG))",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-px text-center">
            <div className="font-mono text-[9.5px] tracking-[.2em] text-tx3">{t.heroToday}</div>
            <div className="font-mono text-[42px] font-medium leading-[1.05] tracking-[-.035em] md:text-[48px]">{fmtNumber(eatenAnim, lang)}</div>
            <div className="max-w-[130px] text-[11.5px] text-tx2">{t.heroEaten}</div>
            <div className="my-[9px] h-px w-[52px] bg-line2" />
            <div className="font-mono text-[11.5px] text-tx2">
              {fmtNumber(daily.target, lang)} {t.kcal}
            </div>
          </div>
        </div>

        <div className="flex min-w-[260px] flex-1 flex-col gap-[18px]">
          <div className="inline-flex w-fit items-center gap-[9px] rounded-full border border-line2 bg-accT py-[7px] pl-2.5 pr-[13px]">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-acc" style={{ boxShadow: "0 0 8px var(--accG)" }} />
            <span className="text-[12.5px] font-medium text-acc">{t.heroStatus}</span>
          </div>
          <div className="max-w-[22ch] font-serif text-[24px] leading-[1.22] tracking-[-.01em] md:text-[29px]">{t.heroPct(ringPct)}</div>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            <StatCell label={t.heroRemainL} value={fmtNumber(Math.max(0, daily.remaining), lang)} />
            <StatCell label={t.heroMealsL} value={`${mealTypesLogged} / 4`} />
            <StatCell label={t.heroStreakL} value={String(streakDays)} />
          </div>
          <div>
            <div className="mb-[7px] flex justify-between font-mono text-[9.5px] tracking-[.12em] text-tx3">
              <span>06:00</span>
              <span>{t.heroFlow}</span>
              <span>24:00</span>
            </div>
            <div className="relative h-[34px]">
              <div className="absolute inset-x-0 top-4 h-px bg-line2" />
              {dayFlowDots.map((d) => (
                <div key={d.id} className="absolute top-4 -translate-x-1/2 -translate-y-1/2" style={{ left: d.left }}>
                  <div className="h-[9px] w-[9px] rounded-full bg-acc opacity-90" style={{ boxShadow: "0 0 10px var(--accG)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surf px-[15px] py-3.5">
      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[9.5px] tracking-[.14em] text-tx3">{label}</div>
      <div className="mt-1.5 font-mono text-[20px] font-medium tracking-[-.02em] md:text-[22px]">{value}</div>
    </div>
  );
}
