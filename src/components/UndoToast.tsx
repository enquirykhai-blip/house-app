import { useUndo } from '../contexts/UndoContext'
import { useLanguage } from '../contexts/LanguageContext'

export function UndoToast() {
  const { pending, undo } = useUndo()
  const { t } = useLanguage()

  if (!pending) return null

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-16 z-40 flex justify-center px-4">
      <div
        key={pending.key}
        className="animate-fade-in-up relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-2xl bg-neutral-900 px-4 py-3 shadow-xl shadow-black/20 dark:bg-neutral-100"
      >
        <p className="min-w-0 flex-1 truncate text-[13px] text-white dark:text-neutral-900">
          {t('deletingLabel', { label: pending.label })}
        </p>
        <button
          onClick={undo}
          className="press shrink-0 text-[13px] font-semibold text-accent"
        >
          {t('undo')}
        </button>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 dark:bg-neutral-900/15">
          <div className="animate-undo-countdown h-full bg-accent" />
        </div>
      </div>
    </div>
  )
}
