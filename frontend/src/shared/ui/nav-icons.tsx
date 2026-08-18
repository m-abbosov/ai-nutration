// Nav icons transcribed verbatim (same <svg> markup) from the design source's sidebar/bottom-nav.
import type { SVGProps } from "react";

export function DashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flex: "none", opacity: 0.9 }} {...props}>
      <circle cx="4.5" cy="4.5" r="2.1" fill="currentColor" />
      <circle cx="11.5" cy="4.5" r="2.1" fill="currentColor" opacity=".45" />
      <circle cx="4.5" cy="11.5" r="2.1" fill="currentColor" opacity=".45" />
      <circle cx="11.5" cy="11.5" r="2.1" fill="currentColor" />
    </svg>
  );
}

export function CoachIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flex: "none", opacity: 0.9 }} {...props}>
      <circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="30 12" />
      <circle cx="8" cy="8" r="2.6" fill="currentColor" />
    </svg>
  );
}

export function MealsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flex: "none", opacity: 0.9 }} {...props}>
      <circle cx="3.4" cy="4" r="1.5" fill="currentColor" />
      <rect x="7" y="3.3" width="6.6" height="1.5" rx=".75" fill="currentColor" opacity=".55" />
      <circle cx="3.4" cy="8" r="1.5" fill="currentColor" />
      <rect x="7" y="7.3" width="5" height="1.5" rx=".75" fill="currentColor" opacity=".55" />
      <circle cx="3.4" cy="12" r="1.5" fill="currentColor" opacity=".4" />
      <rect x="7" y="11.3" width="3.4" height="1.5" rx=".75" fill="currentColor" opacity=".3" />
    </svg>
  );
}

export function ProgIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flex: "none", opacity: 0.9 }} {...props}>
      <rect x="2" y="9" width="3" height="5" rx="1.2" fill="currentColor" opacity=".45" />
      <rect x="6.5" y="5.5" width="3" height="8.5" rx="1.2" fill="currentColor" />
      <rect x="11" y="2.5" width="3" height="11.5" rx="1.2" fill="currentColor" opacity=".65" />
    </svg>
  );
}

export function ProfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flex: "none", opacity: 0.9 }} {...props}>
      <circle cx="8" cy="5.4" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.8 14c.6-3 2.7-4.4 5.2-4.4s4.6 1.4 5.2 4.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function SetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flex: "none", opacity: 0.9 }} {...props}>
      <circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="1.7" fill="currentColor" />
      <rect x="7.3" y="0" width="1.4" height="2.2" rx=".7" fill="currentColor" />
      <rect x="7.3" y="13.8" width="1.4" height="2.2" rx=".7" fill="currentColor" />
    </svg>
  );
}

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" {...props}>
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
  );
}
