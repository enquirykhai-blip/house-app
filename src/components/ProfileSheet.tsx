import { useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { Sheet } from './Sheet'
import { Avatar } from './Avatar'
import { useAuth } from '../contexts/AuthContext'
import { inputClass } from './ui'

interface ProfileSheetProps {
  open: boolean
  onClose: () => void
}

export function ProfileSheet({ open, onClose }: ProfileSheetProps) {
  const { config, role, updateDisplayName } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function close() {
    setEditing(false)
    onClose()
  }

  if (!config) return null

  const members = [
    { key: 'khai' as const, name: config.khaiName },
    { key: 'wife' as const, name: config.wifeName },
  ]

  function startEdit(currentName: string) {
    setName(currentName)
    setEditing(true)
  }

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      await updateDisplayName(trimmed)
      setEditing(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onClose={close} title="Profil">
      <div className="space-y-2">
        {members.map((m) => {
          const isMe = m.key === role
          return (
            <div
              key={m.key}
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-3.5 dark:border-neutral-800"
            >
              <Avatar name={m.name || '?'} accent={isMe} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-neutral-900 dark:text-neutral-50">
                  {m.name || '—'}
                </p>
                <p className="text-sm text-neutral-400">{isMe ? 'Anda' : 'Pasangan anda'}</p>
              </div>
              {isMe && (
                <button
                  onClick={() => startEdit(m.name)}
                  className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                  aria-label="Edit nama"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="animate-fade-in-up mt-4 flex gap-2"
        >
          <input
            autoFocus
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama panggilan"
          />
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="press flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
            aria-label="Simpan"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </form>
      )}
    </Sheet>
  )
}
