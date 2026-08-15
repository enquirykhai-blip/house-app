import type { Language, TranslationKey } from '../i18n/translations'

type T = (key: TranslationKey, params?: Record<string, string | number>) => string

const DAY_MS = 24 * 60 * 60 * 1000

export function startOfDay(ms: number): number {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Days remaining until `dateMs`, relative to today (negative if past). */
export function daysUntil(dateMs: number): number {
  const today = startOfDay(Date.now())
  const target = startOfDay(dateMs)
  return Math.round((target - today) / DAY_MS)
}

export function countdownLabel(dateMs: number, t: T): string {
  const diff = daysUntil(dateMs)
  if (diff === 0) return t('today')
  if (diff === 1) return t('tomorrow')
  if (diff > 1) return t('daysLeft', { count: diff })
  if (diff === -1) return t('yesterday')
  return t('daysAgo', { count: Math.abs(diff) })
}

/**
 * Rolls a possibly-past repeating date forward to its next occurrence
 * strictly after today, preserving time-of-day.
 */
export function nextOccurrence(dateMs: number, repeat: 'none' | 'monthly' | 'yearly'): number {
  if (repeat === 'none') return dateMs
  const today = startOfDay(Date.now())
  const next = new Date(dateMs)
  while (next.getTime() < today) {
    if (repeat === 'monthly') next.setMonth(next.getMonth() + 1)
    else next.setFullYear(next.getFullYear() + 1)
  }
  return next.getTime()
}

export function formatDate(dateMs: number, lang: Language = 'ms'): string {
  return new Date(dateMs).toLocaleDateString(lang === 'en' ? 'en-GB' : 'ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** For <input type="date"> value binding. */
export function toDateInputValue(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromDateInputValue(value: string): number {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

/**
 * Tailwind classes for a countdown badge. Bold solid fills (not soft
 * tints) for anything urgent, so it reads at a glance against a
 * category-tinted card — overdue and "today" also get a gentle pulse to
 * pull the eye.
 */
export function dateBadgeClass(dateMs: number): string {
  const diff = daysUntil(dateMs)
  if (diff < 0) return 'animate-pulse bg-danger text-white shadow-sm shadow-danger/40'
  if (diff === 0) return 'animate-pulse bg-accent text-white shadow-sm shadow-accent/40'
  if (diff <= 3) return 'bg-accent text-white shadow-sm shadow-accent/40'
  return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
}

/** Short relative-time label for activity feeds, e.g. "5 minit lalu" / "5m ago". */
export function relativeTime(ms: number, t: T, lang: Language = 'ms'): string {
  const diffSec = Math.round((Date.now() - ms) / 1000)
  if (diffSec < 30) return t('justNow')
  if (diffSec < 60) return t('secondsAgo', { count: diffSec })
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return t('minutesAgo', { count: diffMin })
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return t('hoursAgo', { count: diffHour })
  const diffDay = Math.round(diffHour / 24)
  if (diffDay < 7) return t('daysAgo', { count: diffDay })
  return formatDate(ms, lang)
}
