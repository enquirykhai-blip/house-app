interface CategoryColorSet {
  /** Solid fill, used for the selected chip in the picker. */
  active: string
  /** Pastel fill, used for unselected picker chips and the category badge in lists. */
  soft: string
}

const PALETTE: CategoryColorSet[] = [
  {
    active: 'bg-blue-600 text-white dark:bg-blue-500',
    soft: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  },
  {
    active: 'bg-purple-600 text-white dark:bg-purple-500',
    soft: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  },
  {
    active: 'bg-emerald-600 text-white dark:bg-emerald-500',
    soft: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  {
    active: 'bg-pink-600 text-white dark:bg-pink-500',
    soft: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
  },
  {
    active: 'bg-amber-600 text-white dark:bg-amber-500',
    soft: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  },
  {
    active: 'bg-teal-600 text-white dark:bg-teal-500',
    soft: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
  },
  {
    active: 'bg-indigo-600 text-white dark:bg-indigo-500',
    soft: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  },
  {
    active: 'bg-rose-600 text-white dark:bg-rose-500',
    soft: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
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
