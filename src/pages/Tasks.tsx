import { useState, type FormEvent } from 'react'
import { CheckSquare, Plus } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { RefreshButton } from '../components/RefreshButton'
import { SwipeToDelete } from '../components/SwipeToDelete'
import { inputClass, labelClass, primaryButtonClass, segmentClass } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useUndo } from '../contexts/UndoContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useTasks } from '../hooks/useTasks'
import { useActivity } from '../hooks/useActivity'
import { useAutoOpenAdd } from '../hooks/useAutoOpenAdd'
import { daysUntil, formatDate, fromDateInputValue, toDateInputValue } from '../utils/date'
import { tick } from '../utils/haptics'
import type { Person, Task } from '../types'
import type { TranslationKey } from '../i18n/translations'

type Filter = 'all' | 'khai' | 'wife'

const personKey: Record<Person, TranslationKey> = {
  khai: 'personKhai',
  wife: 'personWife',
  both: 'personBoth',
}

export function TasksPage() {
  const { user, displayName } = useAuth()
  const { t, language } = useLanguage()
  const { tasks, loading, refreshing, refresh, addTask, toggleDone, removeTask } = useTasks()
  const { logActivity } = useActivity()
  const { pending: pendingDelete, requestDelete } = useUndo()
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState<Person>('both')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useAutoOpenAdd(() => setOpen(true))

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
      await addTask({
        title: title.trim(),
        assignedTo,
        dueDate: dueDate ? fromDateInputValue(dueDate) : undefined,
        createdBy: user.uid,
      })
      if (displayName) await logActivity(user.uid, displayName, 'task_added', title.trim())
      setTitle('')
      setAssignedTo('both')
      setDueDate('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleToggle(t: Task, isDone: boolean) {
    tick()
    toggleDone(t.id, isDone)
    if (isDone && displayName && user) {
      logActivity(user.uid, displayName, 'task_done', t.title)
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
            onClick={() => setOpen(true)}
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
            aria-label={t('addTask')}
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      }
    >
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
            <TaskRow key={t.id} task={t} index={idx} lang={language} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-neutral-400">{t('doneCount', { count: done.length })}</p>
          <ul className="space-y-2">
            {done.map((t, idx) => (
              <TaskRow key={t.id} task={t} index={idx} lang={language} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </ul>
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={t('addTaskTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{t('fieldTitle')}</label>
            <input
              className={inputClass}
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            {submitting ? t('saving') : t('save')}
          </button>
        </form>
      </Sheet>
    </Screen>
  )
}

function TaskRow({
  task,
  index,
  lang,
  onToggle,
  onDelete,
}: {
  task: Task
  index: number
  lang: 'ms' | 'en'
  onToggle: (task: Task, isDone: boolean) => void
  onDelete: (task: Task) => void
}) {
  const { t } = useLanguage()
  const overdue = !task.isDone && task.dueDate != null && daysUntil(task.dueDate) < 0

  return (
    <li className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}>
      <SwipeToDelete onDelete={() => onDelete(task)}>
        <div className="flex items-center gap-3 border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            onClick={() => onToggle(task, !task.isDone)}
            className={`press flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              task.isDone ? 'border-accent bg-accent' : 'border-neutral-300 dark:border-neutral-600'
            }`}
            aria-label={task.isDone ? t('markNotDone') : t('markDone')}
          >
            {task.isDone && <div className="animate-pop h-2 w-2 rounded-full bg-white" />}
          </button>
          <div className="min-w-0 flex-1">
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
          </div>
        </div>
      </SwipeToDelete>
    </li>
  )
}
