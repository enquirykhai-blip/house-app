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

export function countdownLabel(dateMs: number): string {
  const diff = daysUntil(dateMs)
  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Esok'
  if (diff > 1) return `${diff} hari lagi`
  if (diff === -1) return 'Semalam'
  return `${Math.abs(diff)} hari lalu`
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

export function formatDate(dateMs: number): string {
  return new Date(dateMs).toLocaleDateString('ms-MY', {
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

/** Short relative-time label for activity feeds, e.g. "5 minit lalu". */
export function relativeTime(ms: number): string {
  const diffSec = Math.round((Date.now() - ms) / 1000)
  if (diffSec < 30) return 'baru sahaja'
  if (diffSec < 60) return `${diffSec} saat lalu`
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minit lalu`
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  const diffDay = Math.round(diffHour / 24)
  if (diffDay < 7) return `${diffDay} hari lalu`
  return formatDate(ms)
}
