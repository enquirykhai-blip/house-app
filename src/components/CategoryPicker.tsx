import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { inputClass } from './ui'
import { categoryColor } from '../utils/categoryColor'
import { useLanguage } from '../contexts/LanguageContext'

interface CategoryPickerProps {
  categories: string[]
  value: string
  onChange: (value: string) => void
  onAddCategory: (name: string) => Promise<void>
}

export function CategoryPicker({ categories, value, onChange, onAddCategory }: CategoryPickerProps) {
  const { t } = useLanguage()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    try {
      if (!categories.includes(trimmed)) {
        await onAddCategory(trimmed)
      }
      onChange(trimmed)
      setName('')
      setAdding(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const color = categoryColor(c)
          return (
            <button
              key={c}
              type="button"
              className={`press rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                value === c ? color.active : color.soft
              }`}
              onClick={() => onChange(c)}
            >
              {c}
            </button>
          )
        })}
        <button
          type="button"
          className="press flex items-center gap-1 rounded-full bg-neutral-100 px-3.5 py-2 text-[13px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {t('newCategory')}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="animate-fade-in-up mt-2.5 flex gap-2">
          <input
            autoFocus
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('categoryNamePlaceholder')}
          />
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="press shrink-0 rounded-xl bg-neutral-900 px-4 text-[13px] font-semibold text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            {t('save')}
          </button>
        </form>
      )}
    </div>
  )
}
