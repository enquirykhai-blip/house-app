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
import { useImportantDates } from '../hooks/useImportantDates'
import { useActivity } from '../hooks/useActivity'
import { countdownLabel, daysUntil, formatDate, fromDateInputValue, toDateInputValue } from '../utils/date'
import type { ImportantDate } from '../types'

const repeatLabel: Record<ImportantDate['repeat'], string> = {
  none: 'Sekali sahaja',
  monthly: 'Setiap bulan',
  yearly: 'Setiap tahun',
}

function badgeClass(dateMs: number): string {
  const diff = daysUntil(dateMs)
  if (diff < 0) return 'bg-danger-soft text-danger dark:bg-danger/15'
  if (diff <= 3) return 'bg-accent-soft text-accent dark:bg-accent/15'
  return 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
}

export function ImportantDatesPage() {
  const { user, displayName, dateCategories, addDateCategory } = useAuth()
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
        if (displayName) await logActivity(user.uid, displayName, `kemaskini "${payload.title}"`)
      } else {
        await addDate({ ...payload, createdBy: user.uid })
        if (displayName) await logActivity(user.uid, displayName, `tambah tarikh "${payload.title}"`)
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
      title="Tarikh Penting"
      action={
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} />
          <button
            onClick={openForAdd}
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
            aria-label="Tambah tarikh"
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      }
    >
      {loading && <ListSkeleton />}

      {!loading && visibleDates.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="Takde tarikh lagi, tambah satu"
          subtitle="Appointment, bercuti, anniversary, atau apa-apa tarikh penting"
        />
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
                  aria-label={`Edit ${d.title}`}
                >
                  <p className="truncate text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                    {d.title}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-400">
                    {formatDate(d.date)} · {d.category}
                    {d.repeat !== 'none' && ` · ${repeatLabel[d.repeat]}`}
                  </p>
                  {d.notes && <p className="mt-1 truncate text-sm text-neutral-500">{d.notes}</p>}
                </button>
                <span
                  className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(d.date)}`}
                >
                  {countdownLabel(d.date)}
                </span>
              </div>
            </SwipeToDelete>
          </li>
        ))}
      </ul>

      <Sheet open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Tarikh' : 'Tambah Tarikh'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Tajuk</label>
            <input
              className={inputClass}
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Bil elektrik"
            />
          </div>
          <div>
            <label className={labelClass}>Tarikh</label>
            <input
              type="date"
              className={inputClass}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Kategori</label>
            <CategoryPicker
              categories={dateCategories}
              value={category}
              onChange={setCategory}
              onAddCategory={addDateCategory}
            />
          </div>
          <div>
            <label className={labelClass}>Ulangan</label>
            <div className="flex gap-2">
              {(['none', 'monthly', 'yearly'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={segmentClass(repeat === r)}
                  onClick={() => setRepeat(r)}
                >
                  {repeatLabel[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Nota (opsyenal)</label>
            <input
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="cth. TNB account no."
            />
          </div>
          <button type="submit" disabled={submitting || !title.trim()} className={primaryButtonClass}>
            {submitting ? 'Menyimpan...' : editingId ? 'Kemaskini' : 'Simpan'}
          </button>
        </form>
      </Sheet>
    </Screen>
  )
}
