interface CategoryColorSet {
  /** Solid fill, used for the selected chip in the picker. */
  active: string
  /** Soft tint, used for unselected chips and the category badge in lists. */
  soft: string
  /** Small solid dot, used next to the category name in list rows. */
  dot: string
}

const PALETTE: CategoryColorSet[] = [
  {
    active: 'bg-blue-600 text-white dark:bg-blue-500',
    soft: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  {
    active: 'bg-purple-600 text-white dark:bg-purple-500',
    soft: 'bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
  {
    active: 'bg-emerald-600 text-white dark:bg-emerald-500',
    soft: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  {
    active: 'bg-pink-600 text-white dark:bg-pink-500',
    soft: 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
    dot: 'bg-pink-500',
  },
  {
    active: 'bg-amber-600 text-white dark:bg-amber-500',
    soft: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  {
    active: 'bg-teal-600 text-white dark:bg-teal-500',
    soft: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    dot: 'bg-teal-500',
  },
  {
    active: 'bg-indigo-600 text-white dark:bg-indigo-500',
    soft: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    dot: 'bg-indigo-500',
  },
  {
    active: 'bg-rose-600 text-white dark:bg-rose-500',
    soft: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
]

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/** Deterministic color set per category name — same category always gets the same color. */
export function categoryColor(name: string): CategoryColorSet {
  return PALETTE[hash(name) % PALETTE.length]
}
