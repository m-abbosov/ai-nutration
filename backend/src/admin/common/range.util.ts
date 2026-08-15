import { BadRequestException } from '@nestjs/common';
import { formatDateOnly, todayDateOnly } from '../../common/date.util';

export type Range = '7d' | '30d' | '90d' | '1y';

const RANGE_DAYS: Record<Range, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

export function isRange(value: unknown): value is Range {
  return value === '7d' || value === '30d' || value === '90d' || value === '1y';
}

export function parseRange(value: string | undefined): Range {
  if (value === undefined) return '7d';
  if (!isRange(value)) {
    throw new BadRequestException(
      `Invalid range "${value}", expected one of 7d|30d|90d|1y`,
    );
  }
  return value;
}

export function rangeDays(range: Range): number {
  return RANGE_DAYS[range];
}

/** Inclusive [start, end] window in whole calendar days (UTC), `end`
 * defaulting to today. Used for both the "current period" and, shifted
 * back by the same span, the "previous period" a KpiDto compares against. */
export interface DateWindow {
  start: Date;
  end: Date;
}

export function currentWindow(range: Range): DateWindow {
  const end = todayDateOnly();
  const days = rangeDays(range);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { start, end };
}

export function previousWindow(range: Range): DateWindow {
  const days = rangeDays(range);
  const { start: currentStart } = currentWindow(range);
  const end = new Date(currentStart);
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { start, end };
}

/** Start-of-day / end-of-day Date instants for a createdAt-style
 * `DateTime` comparison (as opposed to the `@db.Date`-only `Meal.date`). */
export function windowToTimestamps(window: DateWindow): {
  gte: Date;
  lt: Date;
} {
  const gte = new Date(
    Date.UTC(
      window.start.getUTCFullYear(),
      window.start.getUTCMonth(),
      window.start.getUTCDate(),
    ),
  );
  const lt = new Date(
    Date.UTC(
      window.end.getUTCFullYear(),
      window.end.getUTCMonth(),
      window.end.getUTCDate() + 1,
    ),
  );
  return { gte, lt };
}

export function eachDate(window: DateWindow): string[] {
  const dates: string[] = [];
  const cursor = new Date(window.start);
  while (cursor.getTime() <= window.end.getTime()) {
    dates.push(formatDateOnly(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function kpi(
  value: number,
  previousValue: number,
): { value: number; previousValue: number; deltaPct: number | null } {
  const deltaPct =
    previousValue === 0
      ? null
      : ((value - previousValue) / previousValue) * 100;
  return { value, previousValue, deltaPct };
}
