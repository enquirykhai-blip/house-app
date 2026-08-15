import { X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface BulkAddListProps {
  lines: string[]
  onRemove: (index: number) => void
  onConfirm: () => void
  onCancel: () => void
  submitting: boolean
  confirmLabel: string
}

/** Editable preview of lines parsed from a multi-line paste, shown instead of the normal single-item form. */
export function BulkAddList({ lines, onRemove, onConfirm, onCancel, submitting, confirmLabel }: BulkAddListProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium text-neutral-400">
        {t('bulkItemsDetected', { count: lines.length })}
      </p>
      <ul className="max-h-64 space-y-1.5 overflow-y-auto">
        {lines.map((line, i) => (
          <li
            key={i}
            className="animate-fade-in-up flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-800"
            style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
          >
            <span className="min-w-0 flex-1 truncate text-[14px] text-neutral-800 dark:text-neutral-100">
              {line}
            </span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="press flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-400 dark:text-neutral-500"
              aria-label={t('delete')}
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="press flex-1 rounded-xl bg-neutral-100 px-4 py-3.5 text-[14px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
        >
          {t('cancel')}
        </button>
        <button
          type="button"
          disabled={submitting || lines.length === 0}
          onClick={onConfirm}
          className="press flex-[2] rounded-xl bg-neutral-900 px-4 py-3.5 text-[14px] font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          {submitting ? t('saving') : confirmLabel}
        </button>
      </div>
    </div>
  )
}
