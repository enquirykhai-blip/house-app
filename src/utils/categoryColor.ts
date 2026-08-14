interface CategoryColorSet {
  /** Solid fill, used for the selected chip in the picker. */
  active: string
  /** Pastel fill, used for unselected chips in the picker. */
  chip: string
  /**
   * Pastel wash + border, used to tint an entire list row card. Must stay
   * fully opaque (no `/alpha` backgrounds) — SwipeToDelete renders a solid
   * red delete backdrop directly behind this card, and a translucent
   * background lets it bleed through in dark mode.
   */
  row: string
  /** Text-only tone (no background), used for the category label on a `row`-tinted card. */
  text: string
}

const PALETTE: CategoryColorSet[] = [
  {
    active: 'bg-blue-600 text-white dark:bg-blue-500',
    chip: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    row: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
  },
  {
    active: 'bg-purple-600 text-white dark:bg-purple-500',
    chip: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
    row: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
  },
  {
    active: 'bg-emerald-600 text-white dark:bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    row: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    active: 'bg-pink-600 text-white dark:bg-pink-500',
    chip: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
    row: 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800',
    text: 'text-pink-700 dark:text-pink-300',
  },
  {
    active: 'bg-amber-600 text-white dark:bg-amber-500',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    row: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
  },
  {
    active: 'bg-teal-600 text-white dark:bg-teal-500',
    chip: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
    row: 'bg-teal-50 border-teal-200 dark:bg-teal-950 dark:border-teal-800',
    text: 'text-teal-700 dark:text-teal-300',
  },
  {
    active: 'bg-indigo-600 text-white dark:bg-indigo-500',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
    row: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  {
    active: 'bg-rose-600 text-white dark:bg-rose-500',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    row: 'bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
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
