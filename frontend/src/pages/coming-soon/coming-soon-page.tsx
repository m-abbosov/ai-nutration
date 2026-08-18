import { useTranslation } from "@nutriai/shared/i18n";
import { Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Button } from "@/shared/ui/button";
import { LogoMark } from "@/shared/ui/nav-icons";
import { EmptyState } from "@/shared/ui/state-blocks";

import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";

import { findCalculator } from "@/entities/calculator/lib/calculators";

export function ComingSoonPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const calc = findCalculator(slug);
  const name = calc ? t.landing.calculators[calc.id]?.name : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1280px] items-center gap-2.5 px-[26px] py-[13px]">
          <Link to="/" className="flex items-center gap-2.5 text-tx">
            <LogoMark />
            <span className="text-[16px] font-semibold tracking-[-.015em]">
              AI <span className="text-acc">Nutrition</span>
            </span>
          </Link>
          <div className="flex-1" />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[420px]">
          <EmptyState
            icon={
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-accT text-acc">
                <Sparkles className="h-5 w-5" />
              </span>
            }
            message={`${name ?? t.landing.comingSoon.title} — ${t.landing.comingSoon.body}`}
            action={
              <Button asChild size="sm">
                <Link to="/">{t.landing.comingSoon.backHome}</Link>
              </Button>
            }
          />
        </div>
      </main>
    </div>
  );
}
