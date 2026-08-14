export const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20'

export const labelClass = 'mb-1.5 block text-[13px] font-medium text-neutral-500'

export const primaryButtonClass =
  'w-full rounded-xl bg-neutral-900 px-4 py-3 text-[15px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40'

export const segmentClass = (active: boolean) =>
  `flex-1 rounded-lg px-3 py-2 text-[13px] font-medium transition ${
    active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500'
  }`
