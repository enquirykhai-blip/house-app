import { useState, type ClipboardEvent, type FormEvent, type MouseEvent } from 'react'
import { CheckSquare, Plus, Star } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { RefreshButton } from '../components/RefreshButton'
import { SwipeToDelete } from '../components/SwipeToDelete'
import { PointBurst } from '../components/PointBurst'
import { BulkAddList } from '../components/BulkAddList'
import { inputClass, labelClass, primaryButtonClass, segmentClass } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useUndo } from '../contexts/UndoContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useTasks } from '../hooks/useTasks'
import { useActivity } from '../hooks/useActivity'
import { useAutoOpenAdd } from '../hooks/useAutoOpenAdd'
import { daysUntil, formatDate, fromDateInputValue, toDateInputValue } from '../utils/date'
import { celebrateTick, tick } from '../utils/haptics'
import { parseBulkLines } from '../utils/parseBulkLines'
import type { Person, Task } from '../types'
import type { TranslationKey } from '../i18n/translations'

type Filter = 'all' | 'khai' | 'wife'

const personKey: Record<Person, TranslationKey> = {
  khai: 'personKhai',
  wife: 'personWife',
  both: 'personBoth',
}

export function TasksPage() {
  const { user, displayName, config, points, adjustPoint } = useAuth()
  const { t, language } = useLanguage()
  const { tasks, loading, refreshing, refresh, addTask, updateTask, toggleDone, removeTask } = useTasks()
  const { logActivity } = useActivity()
  const { pending: pendingDelete, requestDelete } = useUndo()
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState<Person>('both')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null)
  const [bulkLines, setBulkLines] = useState<string[] | null>(null)

  function openForAdd() {
    setEditingId(null)
    setTitle('')
    setAssignedTo('both')
    setDueDate('')
    setBulkLines(null)
    setOpen(true)
  }

  useAutoOpenAdd(openForAdd)

  function openForEdit(t: Task) {
    setEditingId(t.id)
    setTitle(t.title)
    setAssignedTo(t.assignedTo)
    setDueDate(t.dueDate ? toDateInputValue(t.dueDate) : '')
    setBulkLines(null)
    setOpen(true)
  }

  // Pasting a multi-line checklist (e.g. copied from Notes) into the title
  // field lists each line as its own task instead of dumping it all into
  // one title.
  function handleTitlePaste(e: ClipboardEvent<HTMLInputElement>) {
    if (editingId) return
    const lines = parseBulkLines(e.clipboardData.getData('text'))
    if (lines.length > 1) {
      e.preventDefault()
      setBulkLines(lines)
    }
  }

  async function handleBulkConfirm() {
    if (!user || !bulkLines) return
    const finalLines = bulkLines.map((l) => l.trim()).filter((l) => l.length > 0)
    if (finalLines.length === 0) return
    setSubmitting(true)
    try {
      for (const line of finalLines) {
        await addTask({ title: line, assignedTo, createdBy: user.uid })
        if (displayName) await logActivity(user.uid, displayName, 'task_added', line)
      }
      setBulkLines(null)
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  function editBulkLine(index: number, value: string) {
    setBulkLines((prev) => (prev ? prev.map((l, i) => (i === index ? value : l)) : prev))
  }

  function removeBulkLine(index: number) {
    setBulkLines((prev) => (prev ? prev.filter((_, i) => i !== index) : prev))
  }

  // Lifted out of TaskRow: completing a task moves it into the "done" list,
  // a different <ul>, which unmounts/remounts the row the instant Firestore's
  // snapshot comes back — often mid-animation. Owning the burst here, keyed
  // to the tap coordinates instead of the row, keeps it playing to completion
  // regardless of how fast the row relocates.
  function celebrateAt(x: number, y: number) {
    setBurst({ id: Date.now(), x, y })
    window.setTimeout(() => setBurst(null), 700)
  }

  const filtered = tasks
    .filter((t) => pendingDelete?.key !== `task-${t.id}`)
    .filter((t) => {
      if (filter === 'all') return true
      return t.assignedTo === filter || t.assignedTo === 'both'
    })
  const notDone = filtered.filter((t) => !t.isDone)
  const done = filtered.filter((t) => t.isDone)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        assignedTo,
        dueDate: dueDate ? fromDateInputValue(dueDate) : undefined,
      }
      if (editingId) {
        await updateTask(editingId, payload)
      } else {
        await addTask({ ...payload, createdBy: user.uid })
        if (displayName) await logActivity(user.uid, displayName, 'task_added', payload.title)
      }
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleToggle(t: Task, isDone: boolean) {
    if (isDone) {
      celebrateTick()
      toggleDone(t.id, true, user?.uid ?? null)
      if (displayName && user) {
        logActivity(user.uid, displayName, 'task_done', t.title)
        adjustPoint(user.uid, 1)
      }
    } else {
      tick()
      toggleDone(t.id, false, null)
      if (t.completedBy) adjustPoint(t.completedBy, -1)
    }
  }

  function handleDelete(t: Task) {
    requestDelete(`task-${t.id}`, t.title, () => removeTask(t.id))
  }

  return (
    <Screen
      title={t('tasksPageTitle')}
      action={
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} />
          <button
            onClick={openForAdd}
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
            aria-label={t('addTask')}
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      }
    >
      {config && (
        <div className="mb-4 flex gap-2" aria-label={t('rewardPoints')}>
          <PointsChip name={config.khaiName || t('personKhai')} value={points.khai} />
          <PointsChip name={config.wifeName || t('personWife')} value={points.wife} />
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {(['all', 'khai', 'wife'] as const).map((f) => (
          <button key={f} className={segmentClass(filter === f)} onClick={() => setFilter(f)}>
            {f === 'all' ? t('filterAll') : t(personKey[f])}
          </button>
        ))}
      </div>

      {loading && <ListSkeleton />}

      {!loading && filtered.length === 0 && (
        <EmptyState icon={CheckSquare} title={t('tasksEmptyTitle')} subtitle={t('tasksEmptySubtitle')} />
      )}

      {notDone.length > 0 && (
        <ul className="space-y-2">
          {notDone.map((t, idx) => (
            <TaskRow
              key={t.id}
              task={t}
              index={idx}
              lang={language}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onCelebrate={celebrateAt}
              onEdit={openForEdit}
            />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-neutral-400">{t('doneCount', { count: done.length })}</p>
          <ul className="space-y-2">
            {done.map((t, idx) => (
              <TaskRow
                key={t.id}
                task={t}
                index={idx}
                lang={language}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onCelebrate={celebrateAt}
                onEdit={openForEdit}
              />
            ))}
          </ul>
        </div>
      )}

      {burst && (
        <div
          className="pointer-events-none fixed z-50"
          style={{ left: burst.x, top: burst.y, width: 0, height: 0 }}
        >
          <PointBurst key={burst.id} />
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={editingId ? t('editTaskTitle') : t('addTaskTitle')}>
        {bulkLines ? (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>{t('assignedTo')}</label>
              <div className="flex gap-2">
                {(['khai', 'wife', 'both'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={segmentClass(assignedTo === p)}
                    onClick={() => setAssignedTo(p)}
                  >
                    {t(personKey[p])}
                  </button>
                ))}
              </div>
            </div>
            <BulkAddList
              lines={bulkLines}
              onEdit={editBulkLine}
              onRemove={removeBulkLine}
              onConfirm={handleBulkConfirm}
              onCancel={() => setBulkLines(null)}
              submitting={submitting}
              confirmLabel={t('addAllCount', {
                count: bulkLines.filter((l) => l.trim().length > 0).length,
              })}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>{t('fieldTitle')}</label>
              <input
                className={inputClass}
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onPaste={handleTitlePaste}
                placeholder={t('taskPlaceholder')}
              />
            </div>
            <div>
              <label className={labelClass}>{t('assignedTo')}</label>
              <div className="flex gap-2">
                {(['khai', 'wife', 'both'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={segmentClass(assignedTo === p)}
                    onClick={() => setAssignedTo(p)}
                  >
                    {t(personKey[p])}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>{t('fieldDueDate', { optional: t('optional') })}</label>
              <input
                type="date"
                className={inputClass}
                value={dueDate}
                min={toDateInputValue(Date.now())}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <button type="submit" disabled={submitting || !title.trim()} className={primaryButtonClass}>
              {submitting ? t('saving') : editingId ? t('update') : t('save')}
            </button>
          </form>
        )}
      </Sheet>
    </Screen>
  )
}

function PointsChip({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white py-1.5 pl-1.5 pr-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        {name.trim().charAt(0).toUpperCase() || '?'}
      </div>
      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{value}</span>
      <Star className="h-3.5 w-3.5 fill-accent text-accent" strokeWidth={0} />
    </div>
  )
}

function TaskRow({
  task,
  index,
  lang,
  onToggle,
  onDelete,
  onCelebrate,
  onEdit,
}: {
  task: Task
  index: number
  lang: 'ms' | 'en'
  onToggle: (task: Task, isDone: boolean) => void
  onDelete: (task: Task) => void
  onCelebrate: (x: number, y: number) => void
  onEdit: (task: Task) => void
}) {
  const { t } = useLanguage()
  const overdue = !task.isDone && task.dueDate != null && daysUntil(task.dueDate) < 0

  function handleCheckboxClick(e: MouseEvent<HTMLButtonElement>) {
    const nextDone = !task.isDone
    if (nextDone) {
      const rect = e.currentTarget.getBoundingClientRect()
      onCelebrate(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }
    onToggle(task, nextDone)
  }

  return (
    <li className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}>
      <SwipeToDelete onDelete={() => onDelete(task)}>
        <div className="flex items-center gap-3 border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            onClick={handleCheckboxClick}
            className={`press flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              task.isDone ? 'border-accent bg-accent' : 'border-neutral-300 dark:border-neutral-600'
            }`}
            aria-label={task.isDone ? t('markNotDone') : t('markDone')}
          >
            {task.isDone && <div className="animate-pop h-2 w-2 rounded-full bg-white" />}
          </button>
          <button
            onClick={() => onEdit(task)}
            className="press min-w-0 flex-1 text-left"
            aria-label={`${t('edit')} ${task.title}`}
          >
            <p
              className={`truncate text-[15px] font-medium transition-colors ${
                task.isDone ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-neutral-50'
              }`}
            >
              {task.title}
            </p>
            <p className={`text-sm ${overdue ? 'font-medium text-danger' : 'text-neutral-400'}`}>
              {t(personKey[task.assignedTo])}
              {task.dueDate && ` · ${formatDate(task.dueDate, lang)}`}
            </p>
          </button>
        </div>
      </SwipeToDelete>
    </li>
  )
}
