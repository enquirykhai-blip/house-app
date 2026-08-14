import { useState, type FormEvent } from 'react'
import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { CategoryPicker } from '../components/CategoryPicker'
import { inputClass, labelClass, primaryButtonClass, segmentClass } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useImportantDates } from '../hooks/useImportantDates'
import { countdownLabel, daysUntil, formatDate, fromDateInputValue, toDateInputValue } from '../utils/date'
import type { ImportantDate } from '../types'

const repeatLabel: Record<ImportantDate['repeat'], string> = {
  none: 'Sekali sahaja',
  monthly: 'Setiap bulan',
  yearly: 'Setiap tahun',
}

function badgeClass(dateMs: number): string {
  const diff = daysUntil(dateMs)
  if (diff < 0) return 'bg-danger-soft text-danger'
  if (diff <= 3) return 'bg-accent-soft text-accent'
  return 'bg-neutral-100 text-neutral-500'
}

export function ImportantDatesPage() {
  const { user, dateCategories, addDateCategory } = useAuth()
  const { dates, loading, addDate, removeDate } = useImportantDates()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(toDateInputValue(Date.now()))
  const [category, setCategory] = useState(dateCategories[0])
  const [repeat, setRepeat] = useState<ImportantDate['repeat']>('none')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setTitle('')
    setDate(toDateInputValue(Date.now()))
    setCategory(dateCategories[0])
    setRepeat('none')
    setNotes('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      await addDate({
        title: title.trim(),
        date: fromDateInputValue(date),
        category,
        repeat,
        notes: notes.trim() || undefined,
        createdBy: user.uid,
      })
      resetForm()
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen
      title="Tarikh Penting"
      action={
        <button
          onClick={() => setOpen(true)}
          className="press flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm shadow-neutral-900/20"
          aria-label="Tambah tarikh"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
        </button>
      }
    >
      {loading && <ListSkeleton />}

      {!loading && dates.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="Takde tarikh lagi, tambah satu"
          subtitle="Appointment, bercuti, anniversary, atau apa-apa tarikh penting"
        />
      )}

      <ul className="space-y-2.5">
        {dates.map((d, idx) => (
          <li
            key={d.id}
            className="animate-fade-in-up flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4"
            style={{ animationDelay: `${Math.min(idx, 8) * 30}ms` }}
          >
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-neutral-900">{d.title}</p>
              <p className="mt-0.5 text-sm text-neutral-400">
                {formatDate(d.date)} · {d.category}
                {d.repeat !== 'none' && ` · ${repeatLabel[d.repeat]}`}
              </p>
              {d.notes && <p className="mt-1 truncate text-sm text-neutral-500">{d.notes}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(d.date)}`}
              >
                {countdownLabel(d.date)}
              </span>
              <button
                onClick={() => removeDate(d.id)}
                className="press flex h-8 w-8 items-center justify-center rounded-full text-neutral-300 active:text-red-400"
                aria-label="Padam"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={open} onClose={() => setOpen(false)} title="Tambah Tarikh">
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
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Sheet>
    </Screen>
  )
}
