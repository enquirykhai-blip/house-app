export const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-neutral-900 placeholder:text-neutral-400 transition-colors duration-150 focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/15 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800'

export const labelClass = 'mb-1.5 block text-[13px] font-medium text-neutral-500 dark:text-neutral-400'

export const primaryButtonClass =
  'press w-full rounded-xl bg-neutral-900 px-4 py-3.5 text-[15px] font-semibold text-white transition-colors disabled:opacity-40 disabled:active:scale-100 dark:bg-white dark:text-neutral-900'

export const segmentClass = (active: boolean) =>
  `press flex-1 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150 ${
    active
      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
  }`

export const chipClass = (active: boolean) =>
  `press rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
    active
      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
  }`
