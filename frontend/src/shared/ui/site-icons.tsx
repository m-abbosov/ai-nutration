import type { CalculatorIcon } from "@/entities/calculator/lib/calculators.ts";

/** Calculator-card icon, shape selected by `CalculatorMeta.icon`. Paths ported
 * verbatim from docs/design-reference/landing.html for pixel fidelity. */
export function CalcIcon({ icon, dash }: { icon: CalculatorIcon; dash: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      {icon === "ring" && (
        <>
          <circle
            cx="9"
            cy="9"
            r="6.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeDasharray={dash || "31 13"}
            strokeLinecap="round"
            transform="rotate(-90 9 9)"
          />
          <circle cx="9" cy="9" r="2.2" fill="currentColor" />
        </>
      )}
      {icon === "bar" && (
        <>
          <rect x="2" y="10" width="3.2" height="6" rx="1.4" fill="currentColor" opacity=".5" />
          <rect x="7.4" y="6" width="3.2" height="10" rx="1.4" fill="currentColor" />
          <rect x="12.8" y="2.6" width="3.2" height="13.4" rx="1.4" fill="currentColor" opacity=".7" />
        </>
      )}
      {icon === "drop" && (
        <path
          d="M9 2.4c2.6 3.2 4.4 5.4 4.4 7.7A4.4 4.4 0 0 1 9 14.6a4.4 4.4 0 0 1-4.4-4.5c0-2.3 1.8-4.5 4.4-7.7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      )}
      {icon === "heart" && (
        <path
          d="M2.4 8.6h2.8l1.5-3 2 6 1.8-4.2 1.2 3.2h3.9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function FeatureOrbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="31 13" />
      <circle cx="9" cy="9" r="2.6" fill="currentColor" />
    </svg>
  );
}

export function FeatureCamIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="2.2" y="4.4" width="13.6" height="10" rx="2.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9.4" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function FeatureChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M2.4 13.2 6.6 8l3.2 2.6 5.8-6.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeatureGlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.4 9h13.2M9 2.4c1.9 2 2.9 4.2 2.9 6.6S10.9 15.6 9 15.6 6.1 11.4 6.1 9 7.1 4.4 9 2.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" className="flex-none opacity-50">
      <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ClearIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12">
      <path d="M2.6 2.6l6.8 6.8M9.4 2.6l-6.8 6.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" className={className} style={{ opacity: 0.6 }}>
      <path d="M2.4 4.4 6 8l3.6-3.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BurgerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16">
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Hero floating-badge icons — self-colored (not `currentColor`), ported verbatim. */
export function BmiFloatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="5.4" fill="none" stroke="var(--acc)" strokeWidth="1.5" strokeDasharray="26 12" transform="rotate(-90 7 7)" />
    </svg>
  );
}

export function ProteinFloatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="3" fill="var(--pro)" />
      <circle cx="7" cy="7" r="6" fill="none" stroke="var(--pro)" strokeWidth="1.2" opacity=".5" />
    </svg>
  );
}

export function BodyFatFloatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="5.4" cy="8" r="3.4" fill="var(--fat)" opacity=".75" />
      <circle cx="9.4" cy="5.6" r="2.4" fill="var(--fat)" />
    </svg>
  );
}

export function StepsFloatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <rect x="2" y="8" width="2.4" height="4" rx="1.2" fill="var(--carb)" opacity=".5" />
      <rect x="5.8" y="5" width="2.4" height="7" rx="1.2" fill="var(--carb)" />
      <rect x="9.6" y="2.4" width="2.4" height="9.6" rx="1.2" fill="var(--carb)" opacity=".7" />
    </svg>
  );
}
