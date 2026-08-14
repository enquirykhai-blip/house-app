import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
    } else if (mounted) {
      setClosing(true)
      const t = setTimeout(() => setMounted(false), 220)
      return () => clearTimeout(t)
    }
  }, [open, mounted])

  useEffect(() => {
    if (!mounted) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-neutral-900/30 backdrop-blur-[1px] dark:bg-black/50 ${
          closing ? 'opacity-0 transition-opacity duration-200' : 'animate-sheet-backdrop'
        }`}
        onClick={onClose}
      />
      <div
        className={`safe-bottom relative w-full max-w-md rounded-t-3xl bg-white px-5 pb-6 pt-4 shadow-2xl dark:bg-neutral-900 ${
          closing
            ? 'translate-y-full transition-transform duration-200 ease-in'
            : 'animate-sheet-slide'
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
          <button
            onClick={onClose}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            aria-label={t('close')}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
