import { useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { Sheet } from './Sheet'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useUndo } from '../contexts/UndoContext'
import { useMemos } from '../hooks/useMemos'
import { useActivity } from '../hooks/useActivity'
import { relativeTime } from '../utils/date'
import type { MemoColor } from '../types'

const MEMO_COLORS: Record<MemoColor, { bg: string; ring: string }> = {
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', ring: 'bg-yellow-400' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-500/20', ring: 'bg-pink-400' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-500/20', ring: 'bg-blue-400' },
  green: { bg: 'bg-green-100 dark:bg-green-500/20', ring: 'bg-green-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-500/20', ring: 'bg-purple-400' },
}

const COLOR_ORDER: MemoColor[] = ['yellow', 'pink', 'blue', 'green', 'purple']

export function MemoBoard() {
  const { user, displayName } = useAuth()
  const { t, language } = useLanguage()
  const { memos, addMemo, removeMemo } = useMemos()
  const { logActivity } = useActivity()
  const { pending, requestDelete } = useUndo()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [color, setColor] = useState<MemoColor>('yellow')
  const [submitting, setSubmitting] = useState(false)

  const visible = memos.filter((m) => pending?.key !== `memo-${m.id}`)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !user || !displayName) return
    setSubmitting(true)
    try {
      await addMemo({ text: trimmed, color, authorUid: user.uid, authorName: displayName })
      await logActivity(user.uid, displayName, 'memo_added', trimmed.slice(0, 40))
      setText('')
      setColor('yellow')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleDelete(id: string, label: string) {
    requestDelete(`memo-${id}`, label, () => removeMemo(id))
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[13px] font-medium text-neutral-400">{t('memosTitle')}</p>
        <button
          onClick={() => setOpen(true)}
          className="press flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
          aria-label={t('addMemo')}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>

      {visible.length === 0 ? (
        <button
          onClick={() => setOpen(true)}
          className="press flex w-full items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-5 text-center text-[13px] text-neutral-400 dark:border-neutral-700"
        >
          {t('noMemosYet')}
        </button>
      ) : (
        <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
          {visible.map((m, idx) => (
            <div
              key={m.id}
              className={`animate-fade-in-up relative w-40 shrink-0 rounded-2xl p-3.5 shadow-sm ${MEMO_COLORS[m.color].bg}`}
              style={{
                animationDelay: `${Math.min(idx, 8) * 30}ms`,
                transform: idx % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)',
              }}
            >
              <button
                onClick={() => handleDelete(m.id, m.text.slice(0, 30))}
                className="press absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-neutral-900/30 dark:text-white/30"
                aria-label={t('deleteMemo')}
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <p className="pr-4 text-[13px] font-medium leading-snug text-neutral-800 dark:text-neutral-100">
                {m.text}
              </p>
              <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                {m.authorName} · {relativeTime(m.createdAt, t, language)}
              </p>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={t('addMemo')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            autoFocus
            rows={3}
            maxLength={140}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('memoPlaceholder')}
            className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent/15 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-800"
          />
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
              {t('memoColor')}
            </p>
            <div className="flex gap-2">
              {COLOR_ORDER.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`press h-8 w-8 rounded-full ${MEMO_COLORS[c].ring} ${
                    color === c ? 'ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-900' : ''
                  }`}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="press w-full rounded-xl bg-neutral-900 px-4 py-3.5 text-[15px] font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            {submitting ? t('posting') : t('post')}
          </button>
        </form>
      </Sheet>
    </section>
  )
}
