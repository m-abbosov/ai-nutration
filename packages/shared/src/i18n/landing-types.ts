/**
 * Public marketing landing page translation namespace — lives under
 * `Dict.landing`, transcribed verbatim from docs/design-reference/landing.html's
 * `const L = { uz, ru, en }` (plus `CN`/`SYN` folded into `calculators`), minus
 * the interactive BMI-demo section, which the real page never ships.
 */
export interface LandingDict {
  seo: {
    title: string;
    description: string;
  };
  nav: {
    home: string;
    calculators: string;
    features: string;
    how: string;
    signIn: string;
    getStarted: string;
  };
  hero: {
    badge: string;
    h1a: string;
    h1b: string;
    h1c: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stat1: string;
    stat2: string;
    stat3: string;
    dashLabel: string;
    today: string;
    kcalEaten: string;
    kcal: string;
    g: string;
    protein: string;
    carbs: string;
    fat: string;
    bodyFat: string;
    steps: string;
    a11yRing: string;
  };
  calc: {
    kicker: string;
    title: string;
    sub: string;
    searchPh: string;
    popular: string;
    calculate: string;
    filterAll: string;
    filterHealth: string;
    filterNutrition: string;
    filterFitness: string;
    emptyTitle: string;
    emptySub: string;
    emptyReset: string;
  };
  features: {
    kicker: string;
    title: string;
    sub: string;
    ft1: string;
    ft1b: string;
    ft2: string;
    ft2b: string;
    ft3: string;
    ft3b: string;
    ft4: string;
    ft4b: string;
  };
  how: {
    kicker: string;
    title: string;
    sub: string;
    st1: string;
    st1b: string;
    st2: string;
    st2b: string;
    st3: string;
    st3b: string;
    st4: string;
    st4b: string;
  };
  cta: {
    kicker: string;
    title: string;
    body: string;
    btn1: string;
    btn2: string;
    note: string;
    fn1: string;
    fn2: string;
    fn3: string;
    fn4: string;
    fnM1: string;
    fnM2: string;
    fnM3: string;
    fnM4: string;
  };
  faq: {
    title: string;
    sub: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    q4: string;
    a4: string;
    q5: string;
    a5: string;
  };
  footer: {
    blurb: string;
    disclaimer: string;
  };
  comingSoon: {
    title: string;
    body: string;
    backHome: string;
  };
  /** Keyed by calculator id (see frontend/src/entities/calculator/lib/calculators.ts). */
  calculators: Record<
    string,
    { name: string; desc: string; synonyms: string[] }
  >;
}
