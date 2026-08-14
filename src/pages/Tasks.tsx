import { useState, type FormEvent } from 'react'
import { CheckSquare, Plus, Trash2 } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { inputClass, labelClass, primaryButtonClass, segmentClass } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useTasks } from '../hooks/useTasks'
import { formatDate, fromDateInputValue, toDateInputValue } from '../utils/date'
import type { Person, Task } from '../types'

type Filter = 'all' | 'khai' | 'wife'

const personLabel: Record<Person, string> = {
  khai: 'Khai',
  wife: 'Wife',
  both: 'Berdua',
}

export function TasksPage() {
  const { user } = useAuth()
  const { tasks, loading, addTask, toggleDone, removeTask } = useTasks()
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState<Person>('both')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return true
    return t.assignedTo === filter || t.assignedTo === 'both'
  })
  const pending = filtered.filter((t) => !t.isDone)
  const done = filtered.filter((t) => t.isDone)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      await addTask({
        title: title.trim(),
        assignedTo,
        dueDate: dueDate ? fromDateInputValue(dueDate) : undefined,
        createdBy: user.uid,
      })
      setTitle('')
      setAssignedTo('both')
      setDueDate('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen
      title="Tugasan Rumah"
      action={
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white"
          aria-label="Tambah tugasan"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
        </button>
      }
    >
      <div className="mb-4 flex gap-2">
        {(['all', 'khai', 'wife'] as const).map((f) => (
          <button
            key={f}
            className={segmentClass(filter === f)}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Semua' : personLabel[f]}
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={CheckSquare}
          title="Takde tugasan lagi"
          subtitle="Tambah kerja rumah untuk berdua"
        />
      )}

      {pending.length > 0 && (
        <ul className="space-y-2">
          {pending.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={toggleDone} onRemove={removeTask} />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-neutral-400">Siap · {done.length}</p>
          <ul className="space-y-2">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={toggleDone} onRemove={removeTask} />
            ))}
          </ul>
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Tambah Tugasan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Tajuk</label>
            <input
              className={inputClass}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="cth. Sapu lantai"
            />
          </div>
          <div>
            <label className={labelClass}>Untuk siapa</label>
            <div className="flex gap-2">
              {(['khai', 'wife', 'both'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={segmentClass(assignedTo === p)}
                  onClick={() => setAssignedTo(p)}
                >
                  {personLabel[p]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Tarikh akhir (opsyenal)</label>
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              min={toDateInputValue(Date.now())}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Sheet>
    </Screen>
  )
}

function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: Task
  onToggle: (id: string, isDone: boolean) => void
  onRemove: (id: string) => void
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5">
      <button
        onClick={() => onToggle(task.id, !task.isDone)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          task.isDone ? 'border-accent bg-accent' : 'border-neutral-300'
        }`}
        aria-label={task.isDone ? 'Tanda belum siap' : 'Tanda siap'}
      >
        {task.isDone && <div className="h-2 w-2 rounded-full bg-white" />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[15px] font-medium ${
            task.isDone ? 'text-neutral-400 line-through' : 'text-neutral-900'
          }`}
        >
          {task.title}
        </p>
        <p className="text-sm text-neutral-400">
          {personLabel[task.assignedTo]}
          {task.dueDate && ` · ${formatDate(task.dueDate)}`}
        </p>
      </div>
      <button
        onClick={() => onRemove(task.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-300 active:text-red-400"
        aria-label="Padam"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </li>
  )
}
