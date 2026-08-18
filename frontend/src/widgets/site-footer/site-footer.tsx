import { useTranslation } from "@nutriai/shared/i18n";
import { Link } from "react-router-dom";

import { CALCS, CALC_CATEGORY_COLOR } from "@/entities/calculator/lib/calculators";

export function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-line bg-bg2">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-[34px] px-[26px] pb-[34px] pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 26 26">
              <circle
                cx="13"
                cy="13"
                r="9.5"
                fill="none"
                stroke="var(--acc)"
                strokeWidth="1.6"
                strokeDasharray="45 60"
                strokeLinecap="round"
                transform="rotate(-90 13 13)"
              />
              <circle cx="13" cy="13" r="3.4" fill="var(--acc)" />
            </svg>
            <span className="text-[15px] font-semibold tracking-[-.015em]">
              AI <span className="text-acc">Nutrition</span>
            </span>
          </div>
          <p className="mt-3.5 max-w-[32ch] text-[12.5px] leading-[1.6] text-tx3 text-pretty">{t.landing.footer.blurb}</p>
        </div>
        {(["health", "nutrition", "fitness"] as const).map((cat) => (
          <div key={cat} className="min-w-0">
            <div className="mb-3.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-sm" style={{ background: CALC_CATEGORY_COLOR[cat] }} />
              <span className="font-mono text-[9px] tracking-[.16em] text-tx3">
                {
                  {
                    health: t.landing.calc.filterHealth,
                    nutrition: t.landing.calc.filterNutrition,
                    fitness: t.landing.calc.filterFitness,
                  }[cat]
                }
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {CALCS.filter((c) => c.cat === cat).map((c) => (
                <Link
                  key={c.id}
                  to={`/calculators/${c.id}`}
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] text-tx2 hover:text-acc"
                >
                  {t.landing.calculators[c.id]?.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[1280px] px-[26px] pb-[34px]">
        <div className="flex flex-wrap items-center gap-4 border-t border-line pt-[22px]">
          <span className="text-[11.5px] text-tx3">© 2026 AI Nutrition</span>
          <span className="flex-1" />
          <span className="max-w-[64ch] text-[11.5px] text-tx3 text-pretty">{t.landing.footer.disclaimer}</span>
        </div>
      </div>
    </footer>
  );
}
