/**
 * Helpers for the calendar-day (`@db.Date`) semantics used by `Meal.date`.
 * We always work with UTC-midnight `Date` objects and `YYYY-MM-DD` strings
 * so comparisons against Postgres DATE columns are unambiguous regardless
 * of server timezone.
 */

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayDateOnly(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/** Parses a `YYYY-MM-DD` string into a UTC-midnight Date. Throws on any
 * other shape so callers can turn it into a 400. */
export function parseDateOnly(value: string): Date {
  if (!DATE_ONLY_RE.test(value)) {
    throw new Error(`Invalid date "${value}", expected YYYY-MM-DD`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date "${value}"`);
  }
  return date;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function isSameDateOnly(a: Date, b: Date): boolean {
  return formatDateOnly(a) === formatDateOnly(b);
}
