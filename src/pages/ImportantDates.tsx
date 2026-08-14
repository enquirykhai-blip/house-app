import { useState, type FormEvent } from 'react'
import { CalendarClock, Plus } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { CategoryPicker } from '../components/CategoryPicker'
import { RefreshButton } from '../components/RefreshButton'
import { SwipeToDelete } from '../components/SwipeToDelete'
import { inputClass, labelClass, primaryButtonClass, segmentClass } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useUndo } from '../contexts/UndoContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useImportantDates } from '../hooks/useImportantDates'
import { useActivity } from '../hooks/useActivity'
import { useAutoOpenAdd } from '../hooks/useAutoOpenAdd'
import {
  countdownLabel,
  dateBadgeClass,
  formatDate,
  fromDateInputValue,
  toDateInputValue,
} from '../utils/date'
import { categoryColor } from '../utils/categoryColor'
import type { ImportantDate } from '../types'
import type { TranslationKey } from '../i18n/translations'

const repeatKey: Record<ImportantDate['repeat'], TranslationKey> = {
  none: 'repeatNone',
  monthly: 'repeatMonthly',
  yearly: 'repeatYearly',
}

export function ImportantDatesPage() {
  const { user, displayName, dateCategories, addDateCategory } = useAuth()
  const { t, language } = useLanguage()
  const { dates, loading, refreshing, refresh, addDate, updateDate, removeDate } = useImportantDates()
  const { logActivity } = useActivity()
  const { pending: pendingDelete, requestDelete } = useUndo()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(toDateInputValue(Date.now()))
  const [category, setCategory] = useState(dateCategories[0])
  const [repeat, setRepeat] = useState<ImportantDate['repeat']>('none')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const visibleDates = dates.filter((d) => pendingDelete?.key !== `date-${d.id}`)

  function openForAdd() {
    setEditingId(null)
    setTitle('')
    setDate(toDateInputValue(Date.now()))
    setCategory(dateCategories[0])
    setRepeat('none')
    setNotes('')
    setOpen(true)
  }

  useAutoOpenAdd(openForAdd)

  function openForEdit(d: ImportantDate) {
    setEditingId(d.id)
    setTitle(d.title)
    setDate(toDateInputValue(d.date))
    setCategory(d.category)
    setRepeat(d.repeat)
    setNotes(d.notes ?? '')
    setOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        date: fromDateInputValue(date),
        category,
        repeat,
        notes: notes.trim() || undefined,
      }
      if (editingId) {
        await updateDate(editingId, payload)
        if (displayName) await logActivity(user.uid, displayName, 'date_updated', payload.title)
      } else {
        await addDate({ ...payload, createdBy: user.uid })
        if (displayName) await logActivity(user.uid, displayName, 'date_added', payload.title)
      }
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDelete(d: ImportantDate) {
    requestDelete(`date-${d.id}`, d.title, () => removeDate(d.id))
  }

  return (
    <Screen
      title={t('datesPageTitle')}
      action={
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} />
          <button
            onClick={openForAdd}
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
            aria-label={t('addDate')}
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      }
    >
      {loading && <ListSkeleton />}

      {!loading && visibleDates.length === 0 && (
        <EmptyState icon={CalendarClock} title={t('datesEmptyTitle')} subtitle={t('datesEmptySubtitle')} />
      )}

      <ul className="space-y-2.5">
        {visibleDates.map((d, idx) => (
          <li
            key={d.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(idx, 8) * 30}ms` }}
          >
            <SwipeToDelete onDelete={() => handleDelete(d)}>
              <div className="flex items-center justify-between gap-2 border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <button
                  onClick={() => openForEdit(d)}
                  className="press min-w-0 flex-1 text-left"
                  aria-label={`${t('edit')} ${d.title}`}
                >
                  <p className="truncate text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                    {d.title}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-neutral-400">
                    <span>{formatDate(d.date, language)} ·</span>
                    <span className="inline-flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${categoryColor(d.category).dot}`} />
                      {d.category}
                    </span>
                    {d.repeat !== 'none' && <span>· {t(repeatKey[d.repeat])}</span>}
                  </p>
                  {d.notes && <p className="mt-1 truncate text-sm text-neutral-500">{d.notes}</p>}
                </button>
                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${dateBadgeClass(d.date)}`}
                >
                  {countdownLabel(d.date, t)}
                </span>
              </div>
            </SwipeToDelete>
          </li>
        ))}
      </ul>

      <Sheet open={open} onClose={() => setOpen(false)} title={editingId ? t('editDateTitle') : t('addDateTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{t('fieldTitle')}</label>
            <input
              className={inputClass}
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholderBill')}
            />
          </div>
          <div>
            <label className={labelClass}>{t('fieldDate')}</label>
            <input
              type="date"
              className={inputClass}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>{t('fieldCategory')}</label>
            <CategoryPicker
              categories={dateCategories}
              value={category}
              onChange={setCategory}
              onAddCategory={addDateCategory}
            />
          </div>
          <div>
            <label className={labelClass}>{t('fieldRepeat')}</label>
            <div className="flex gap-2">
              {(['none', 'monthly', 'yearly'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={segmentClass(repeat === r)}
                  onClick={() => setRepeat(r)}
                >
                  {t(repeatKey[r])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>{t('fieldNotes', { optional: t('optional') })}</label>
            <input
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
            />
          </div>
          <button type="submit" disabled={submitting || !title.trim()} className={primaryButtonClass}>
            {submitting ? t('saving') : editingId ? t('update') : t('save')}
          </button>
        </form>
      </Sheet>
    </Screen>
  )
}
