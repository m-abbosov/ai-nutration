/**
 * Shape of the UI translation dictionary. Keys under each labeled section are
 * transcribed verbatim (copy unchanged) from the corresponding object in
 * docs/design-reference/NutriAI.dc.html's `<script data-dc-script>` block
 * (`const T`, `const C`, `const M`, `const S`, `const MB`) — see
 * shared/i18n/locales/*.ts for the source line each block came from.
 *
 * The prototype's *scripted mock content* (canned chat replies r0-r3/rs,
 * mock conversation titles h1-h5, mock meal-item food names, mock nutrition
 * card names) is intentionally NOT part of this dictionary — DESIGN_MAPPING.md
 * is explicit that AI-generated content is never routed through UI i18n; it
 * comes from the backend/Gemini directly, in the user's selected language.
 *
 * A small `app` section holds strings the real product needs that the
 * static mock didn't (auth errors, loading/empty states, form labels,
 * generic actions) — these are original copy, written to match the voice
 * of the surrounding transcribed strings, not from the source file.
 */
import type { AdminDict } from "./admin-types";
import type { LandingDict } from "./landing-types";
import type { CalcPagesDict } from "./calc-pages-types";

export interface Dict {
  // T — global chrome / dashboard
  navSection: string;
  navDash: string;
  navCoach: string;
  navMeals: string;
  navProg: string;
  navProf: string;
  navSet: string;
  plan: string;
  greet: string;
  greetSub: string;
  date: string;
  heroToday: string;
  heroEaten: string;
  heroStatus: string;
  heroPct: (pct: number) => string;
  heroRemainL: string;
  heroMealsL: string;
  heroStreakL: string;
  heroFlow: string;
  kcal: string;
  g: string;
  macroTitle: string;
  ofTarget: string;
  mProtein: string;
  mCarbs: string;
  mFat: string;
  mealsTitle: string;
  viewAll: string;
  bfast: string;
  lunch: string;
  snack: string;
  dinner: string;
  noDinner: string;
  askAI: string;
  aiTitle: string;
  aiBadge: string;
  aiCta: string;
  aiAlt: string;
  chartTitle: string;
  chartSub: (target: number) => string;
  chartConsumed: string;
  chartTarget: string;
  days: string[];
  dayFull: string[];
  monthFull: string[];
  overT: string;
  underT: string;
  onT: string;

  // C — AI chat
  chatStatus: string;
  chatNew: string;
  histToday: string;
  histYest: string;
  histPrev7: string;
  histOlder: string;
  emptyTitle: string;
  emptySub: string;
  qa0: string;
  qa1: string;
  qa2: string;
  qa3: string;
  inputPh: string;
  send: string;
  addMealToToday: string;
  addedMeal: string;
  typing: string;
  disclaimer: string;
  sugg1: string;
  sugg2: string;
  sugg3: string;

  // M — meals / progress
  mpTitle: string;
  mpSub: string;
  mpToday: string;
  addMeal: string;
  optAI: string;
  optAISub: string;
  optQuick: string;
  optQuickSub: string;
  optMan: string;
  optManSub: string;
  edit: string;
  del: string;
  itemsN: string;
  remainL: string;
  pgTitle: string;
  pgSub: string;
  pgTrend: string;
  pgAvgCal: string;
  pgAvgPro: string;
  pgAdher: string;
  pgDays: string;
  pgVs: string;
  pgUnderT: string;
  pgWeight: string;
  pgWeightSub: string;
  pgGoalW: string;
  pgToGoal: string;
  pgKg: string;
  pgMacroT: string;
  pgAvg: string;
  pgTargetW: string;
  r7: string;
  r30: string;
  r90: string;

  // S — profile / settings / auth / onboarding
  prTitle: string;
  prSub: string;
  prEdit: string;
  prStreakDays: (n: number) => string;
  prBody: string;
  prGoals: string;
  prAge: string;
  prHeight: string;
  prWeight: string;
  prBmi: string;
  prGoal: string;
  prAct: string;
  prRate: string;
  prTarget: string;
  prSplit: string;
  prYears: string;
  goalLabel: Record<"LOSE" | "MAINTAIN" | "GAIN", string>;
  activityLabel: Record<"SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE", string>;
  genderLabel: Record<"MALE" | "FEMALE" | "OTHER", string>;
  aiProviderLabel: Record<"GEMINI" | "OPENAI" | "CLAUDE" | "GROQ", string>;
  aiKeyStatusLabel: Record<"OK" | "EXHAUSTED" | "INVALID", string>;

  stTitle: string;
  stSub: string;
  stAppear: string;
  stTheme: string;
  stThemeSub: string;
  stLight: string;
  stDark: string;
  stLangT: string;
  stLangSub: string;
  stAI: string;
  stGem: string;
  stGemSub: string;
  stConn: string;
  stDisconnected: string;
  stKey: string;
  stNotif: string;
  stN1: string;
  stN1s: string;
  stN2: string;
  stN2s: string;
  stN3: string;
  stN3s: string;
  stAcc: string;
  stOut: string;
  stVer: string;

  auTitle: string;
  auSub: string;
  auGoogle: string;
  auOr: string;
  auQuote: string;
  auStat1: string;
  auStat2: string;

  onStep: string;
  onQ1: string;
  onQ1s: string;
  onG1: string;
  onG1s: string;
  onG2: string;
  onG2s: string;
  onG3: string;
  onG3s: string;
  onQ2: string;
  onQ2s: string;
  onQ3: string;
  onQ3s: string;
  onA1: string;
  onA2: string;
  onA3: string;
  onA4: string;
  onDone: string;
  onDoneS: string;
  onStart: string;
  onNext: string;
  onBack: string;
  onKcal: string;

  mb: {
    home: string;
    chat: string;
    meals: string;
    prog: string;
    me: string;
    hist: string;
    sheetT: string;
    add: string;
  };

  // Original app copy not present in the static mock (auth flows, loading/
  // empty/error states, forms) — see the doc-comment above.
  app: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    cancel: string;
    delete: string;
    confirmDeleteMeal: string;
    signInWithTelegram: string;
    telegramUnavailable: string;
    signOutConfirm: string;
    noConversations: string;
    conversationsError: string;
    mealsEmpty: string;
    dashboardError: string;
    onboardingRequired: string;
    genderOptional: string;
    genderLabelField: string;
    goalWeightLabel: string;
    mealNameLabel: string;
    mealTypeLabel: string;
    caloriesLabel: string;
    proteinLabel: string;
    carbsLabel: string;
    fatLabel: string;
    servingSizeLabel: string;
    mealItemsLabel: string;
    required: string;
    mustBePositive: string;
    manualEntryTitle: string;
    manualEntrySub: string;
    recommendationsTitle: string;
    getRecommendations: string;
    notConnected: string;
    tryAgain: string;
    ageLabel: string;
    heightLabel: string;
    weightLabel: string;
    continueWithTelegram: string;
    welcomeToNutriAI: string;
    getStarted: string;
    profileUpdated: string;
    addedToMeals: string;
    perWeek: string;
    collapseSidebar: string;
    expandSidebar: string;
    confirmDeleteMealTitle: string;
    selectPreviousMeal: string;
    selectPreviousMealPh: string;
    noPreviousMeals: string;
    aiApiKeyLabel: string;
    aiProviderSelectLabel: string;
    aiApiKeyPh: string;
    aiGetKeyLink: (provider: string) => string;
    aiFreeBadge: string;
    aiPaidBadge: string;
    aiBillingDialogTitle: (provider: string) => string;
    aiBillingDialogBody: (provider: string) => string;
    aiBillingDialogCta: string;
    mcpConsentTitle: (client: string) => string;
    mcpConsentBody: string;
    mcpConsentAllow: string;
    mcpConsentDeny: string;
    mcpConsentNeedLogin: string;
    mcpConsentSignIn: string;
    mcpConsentError: string;
    mcpConsentRedirecting: string;
    aiSaveKey: string;
    aiRemoveKey: string;
    aiNotConfigured: string;
    aiSettingsSub: string;
    aiOnboardingTitle: string;
    aiOnboardingSub: string;
    aiOnboardingSkip: string;
    aiOnboardingSave: string;
    aiChatBanner: string;
    aiRecommendationsBanner: string;
    aiGoToSettings: string;
    today: string;
    yesterday: string;
    previousDay: string;
    nextDay: string;
    backToToday: string;
    mealEditSuggestionTitle: string;
    mealEditApply: string;
    mealEditApplied: string;
    mealEditFailed: string;
    mcpSettingsUrlLabel: string;
    mcpSettingsCopy: string;
    mcpSettingsCopied: string;
    mcpCapabilitiesTitle: string;
    mcpCapability1: string;
    mcpCapability2: string;
    mcpCapability3: string;
    mcpCapability4: string;
    mcpCapability5: string;
    mcpClaudeTitle: string;
    mcpClaudeSub: string;
    mcpClaudeStep1: string;
    mcpClaudeStep2: string;
    mcpClaudeStep3: string;
    mcpClaudeStep4: string;
    mcpClaudeStep5: string;
    mcpChatgptTitle: string;
    mcpChatgptSub: string;
    mcpChatgptPlanNote: string;
    mcpChatgptStep1: string;
    mcpChatgptStep2: string;
    mcpChatgptStep3: string;
    mcpChatgptStep4: string;
    mcpChatgptStep5: string;
  };

  // Admin Panel (Phase 2) — see shared/i18n/admin-types.ts
  admin: AdminDict;

  // Public marketing landing page — see shared/i18n/landing-types.ts
  landing: LandingDict;

  // The 14 working /calculators/:slug pages — see shared/i18n/calc-pages-types.ts
  calcPages: CalcPagesDict;
}
