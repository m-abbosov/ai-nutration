import type { Language } from "../api/types";

/**
 * Thousands separator formatter, ported verbatim from the design source's
 * `fmt()` (NutriAI.dc.html, `class Component`): space-separated for uz/ru,
 * comma-separated for en.
 */
export function fmtNumber(n: number, lang: Language): string {
  const sep = lang === "EN" ? "," : " ";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

/** Decimal-comma formatting for locales that use it (uz/ru), dot for en. */
export function fmtDecimal(n: number, lang: Language, digits = 1): string {
  const s = n.toFixed(digits);
  return lang === "EN" ? s : s.replace(".", ",");
}

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Grouping bucket labels for chat conversation history. */
export type DateBucket = "today" | "yesterday" | "previous7" | "older";

export function bucketForDate(iso: string, now: Date = new Date()): DateBucket {
  const d = new Date(iso);
  const startOfDay = (dt: Date) =>
    new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const today = startOfDay(now);
  const target = startOfDay(d);
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / 86_400_000,
  );
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays <= 7) return "previous7";
  return "older";
}

export function groupByDateBucket<T extends { updatedAt: string }>(
  items: T[],
  now: Date = new Date(),
): Record<DateBucket, T[]> {
  const groups: Record<DateBucket, T[]> = {
    today: [],
    yesterday: [],
    previous7: [],
    older: [],
  };
  for (const item of items) {
    groups[bucketForDate(item.updatedAt, now)].push(item);
  }
  return groups;
}

export function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Local (browser-timezone) calendar day as YYYY-MM-DD — matches native `<input type="date">` value semantics. */
export function todayLocalISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parses a YYYY-MM-DD string into a local-midnight Date — matches native `<input type="date">` value semantics. */
export function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Formats a local Date back into a YYYY-MM-DD string (inverse of `isoToLocalDate`). */
export function localDateToISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Shifts a YYYY-MM-DD string by N calendar days (local time, DST-safe via noon anchor). */
export function shiftDateISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const shifted = new Date(y, m - 1, d, 12);
  shifted.setDate(shifted.getDate() + days);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}-${String(shifted.getDate()).padStart(2, "0")}`;
}

/** Human label for a YYYY-MM-DD date relative to today: "Today" / "Yesterday" / localized day-month. */
export function formatDateLabel(
  iso: string,
  locale: string,
  today: string,
  yesterday: string,
): string {
  const now = todayLocalISO();
  if (iso === now) return today;
  if (iso === shiftDateISO(now, -1)) return yesterday;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
  });
}
