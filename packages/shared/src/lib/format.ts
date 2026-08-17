import type { Language } from '../api/types'

/**
 * Thousands separator formatter, ported verbatim from the design source's
 * `fmt()` (NutriAI.dc.html, `class Component`): space-separated for uz/ru,
 * comma-separated for en.
 */
export function fmtNumber(n: number, lang: Language): string {
  const sep = lang === 'EN' ? ',' : ' '
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep)
}

/** Decimal-comma formatting for locales that use it (uz/ru), dot for en. */
export function fmtDecimal(n: number, lang: Language, digits = 1): string {
  const s = n.toFixed(digits)
  return lang === 'EN' ? s : s.replace('.', ',')
}

export function pct(part: number, total: number): number {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/** Grouping bucket labels for chat conversation history. */
export type DateBucket = 'today' | 'yesterday' | 'previous7' | 'older'

export function bucketForDate(iso: string, now: Date = new Date()): DateBucket {
  const d = new Date(iso)
  const startOfDay = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
  const today = startOfDay(now)
  const target = startOfDay(d)
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000)
  if (diffDays <= 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays <= 7) return 'previous7'
  return 'older'
}

export function groupByDateBucket<T extends { updatedAt: string }>(
  items: T[],
  now: Date = new Date(),
): Record<DateBucket, T[]> {
  const groups: Record<DateBucket, T[]> = { today: [], yesterday: [], previous7: [], older: [] }
  for (const item of items) {
    groups[bucketForDate(item.updatedAt, now)].push(item)
  }
  return groups
}

export function formatTime(iso: string, locale: string): string {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}
