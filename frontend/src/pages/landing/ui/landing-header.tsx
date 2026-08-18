import { useEffect, useRef, useState } from "react";

import type { Language } from "@nutriai/shared/api/types";
import { langFlag, langName, useTranslation } from "@nutriai/shared/i18n";
import { cn } from "@nutriai/shared/lib/cn";
import { Link } from "react-router-dom";

import { LogoMark } from "@/shared/ui/nav-icons.tsx";

import { ThemeToggle } from "@/features/theme-toggle/theme-toggle.tsx";

import { CALCS, CALC_CATEGORY_COLOR, type CalculatorCategory } from "@/entities/calculator/lib/calculators.ts";

import { BurgerIcon, ChevronDownIcon } from "./landing-icons.tsx";

const CATEGORIES: CalculatorCategory[] = ["health", "nutrition", "fitness"];
const LANGS: Language[] = ["UZ", "RU", "EN"];

export function LandingHeader() {
  const { t, lang, setLang } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setLangOpen(false);
        setCalcOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const groups = CATEGORIES.map((cat) => ({
    cat,
    label: t.landing.calc[`filter${cat[0].toUpperCase()}${cat.slice(1)}` as "filterHealth" | "filterNutrition" | "filterFitness"],
    col: CALC_CATEGORY_COLOR[cat],
    items: CALCS.filter((c) => c.cat === cat).map((c) => ({ id: c.id, name: t.landing.calculators[c.id]?.name ?? c.id, pop: c.pop })),
  }));

  const closeAll = () => {
    setLangOpen(false);
    setCalcOpen(false);
    setMenuOpen(false);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-[80] border-b border-line bg-glass backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1280px] items-center gap-3.5 px-[26px] py-[13px]">
        <a href="#top" className="flex flex-none items-center gap-2.5 text-tx">
          <span className="relative block h-[26px] w-[26px]">
            <span className="absolute inset-0 animate-halo rounded-full bg-accT" />
            <LogoMark className="relative block" />
          </span>
          <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-.015em]">
            AI <span className="text-acc">Nutrition</span>
          </span>
        </a>

        <nav aria-label="Main" className="ml-3.5 hidden items-center gap-0.5 lg:flex">
          <a
            href="#top"
            className="whitespace-nowrap rounded-[10px] px-3 py-2 text-[13.5px] font-medium text-tx2 transition-colors hover:bg-surf2 hover:text-tx"
          >
            {t.landing.nav.home}
          </a>
          <div className="relative">
            <button
              onClick={() => {
                setCalcOpen((v) => !v);
                setLangOpen(false);
              }}
              aria-expanded={calcOpen}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 py-2 text-[13.5px] font-medium transition-colors hover:bg-surf2 hover:text-tx",
                calcOpen ? "bg-surf2 text-tx" : "text-tx2",
              )}
            >
              {t.landing.nav.calculators}
              <ChevronDownIcon className={cn("transition-transform", calcOpen && "rotate-180")} />
            </button>
            {calcOpen && (
              <div className="animate-fu absolute left-[-14px] top-[calc(100%+9px)] z-[90] grid w-[min(660px,84vw)] grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-[22px] rounded-[18px] border border-line2 bg-surf2 p-5 shadow-card">
                {groups.map((g) => (
                  <div key={g.cat}>
                    <div className="flex items-center gap-2 px-2 pb-2.5">
                      <span className="h-1.5 w-1.5 rounded-sm" style={{ background: g.col }} />
                      <span className="font-mono text-[9.5px] tracking-[.16em] text-tx3">{g.label}</span>
                    </div>
                    <div className="flex flex-col gap-px">
                      {g.items.map((c) => (
                        <Link
                          key={c.id}
                          to={`/calculators/${c.id}`}
                          onClick={closeAll}
                          className="flex items-center gap-2 rounded-[9px] px-2 py-[7px] text-[13px] text-tx2 hover:bg-surfH hover:text-tx"
                        >
                          <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{c.name}</span>
                          {c.pop && (
                            <span className="flex-none rounded-[5px] bg-accT px-[5px] py-[2px] font-mono text-[8.5px] tracking-[.1em] text-acc">
                              {t.landing.calc.popular}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <a
            href="#features"
            className="whitespace-nowrap rounded-[10px] px-3 py-2 text-[13.5px] font-medium text-tx2 transition-colors hover:bg-surf2 hover:text-tx"
          >
            {t.landing.nav.features}
          </a>
          <a
            href="#how"
            className="whitespace-nowrap rounded-[10px] px-3 py-2 text-[13.5px] font-medium text-tx2 transition-colors hover:bg-surf2 hover:text-tx"
          >
            {t.landing.nav.how}
          </a>
        </nav>

        <div className="flex-1" />

        <div className="relative hidden lg:block">
          <button
            onClick={() => {
              setLangOpen((v) => !v);
              setCalcOpen(false);
            }}
            aria-label="Language"
            className="flex items-center gap-2 rounded-[10px] border border-line px-[11px] py-2 text-[12.5px] text-tx2 hover:bg-surf2 hover:text-tx"
          >
            <span>{langFlag[lang]}</span>
            <span className="font-mono text-[11px] tracking-[.1em]">{lang}</span>
          </button>
          {langOpen && (
            <div className="animate-fu absolute right-0 top-[calc(100%+7px)] z-[90] w-[186px] rounded-[13px] border border-line2 bg-surf2 p-1.5 shadow-card">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setLangOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-[9px] text-[13px] hover:bg-surfH"
                >
                  <span>{langFlag[l]}</span>
                  <span className="flex-1 text-left">{langName[l]}</span>
                  {lang === l && <span className="text-acc">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <ThemeToggle className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] border border-line text-tx2 hover:bg-surf2 hover:text-tx" />

        <Link
          to="/login"
          className="hidden whitespace-nowrap rounded-[10px] px-[13px] py-[9px] text-[13px] font-medium text-tx2 hover:bg-surf2 hover:text-tx lg:block"
        >
          {t.landing.nav.signIn}
        </Link>
        <Link
          to="/login"
          className="hidden whitespace-nowrap rounded-[11px] bg-acc px-4 py-2.5 text-[13px] font-semibold text-[#04120e] shadow-[0_8px_22px_-12px_var(--accG)] transition-[filter] hover:brightness-[1.08] sm:inline-flex"
        >
          {t.landing.nav.getStarted}
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          className="grid h-[34px] w-[34px] flex-none place-items-center rounded-[10px] border border-line text-tx2 lg:hidden"
        >
          <BurgerIcon />
        </button>
      </div>

      {menuOpen && (
        <div className="animate-fu border-t border-line bg-bg2 px-5 pb-[22px] pt-4">
          <div className="flex flex-col gap-0.5">
            <a href="#top" onClick={closeAll} className="rounded-[11px] px-2.5 py-3 text-[15px] font-medium text-tx hover:bg-surf2">
              {t.landing.nav.home}
            </a>
            <a href="#calculators" onClick={closeAll} className="rounded-[11px] px-2.5 py-3 text-[15px] font-medium text-tx hover:bg-surf2">
              {t.landing.nav.calculators}
            </a>
            <a href="#features" onClick={closeAll} className="rounded-[11px] px-2.5 py-3 text-[15px] font-medium text-tx hover:bg-surf2">
              {t.landing.nav.features}
            </a>
            <a href="#how" onClick={closeAll} className="rounded-[11px] px-2.5 py-3 text-[15px] font-medium text-tx hover:bg-surf2">
              {t.landing.nav.how}
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "rounded-[10px] border px-[13px] py-2.5 font-mono text-[12.5px] tracking-[.1em]",
                  lang === l ? "border-acc bg-accT" : "border-line2",
                )}
              >
                {langFlag[l]} {l}
              </button>
            ))}
            <span className="flex-1" />
            <Link to="/login" onClick={closeAll} className="rounded-[11px] bg-acc px-[17px] py-[11px] text-[13px] font-semibold text-[#04120e]">
              {t.landing.nav.getStarted}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
