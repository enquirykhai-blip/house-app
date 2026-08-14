import { useState, type FormEvent } from 'react'
import { Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'
import { inputClass, labelClass, primaryButtonClass, segmentClass } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import { useGroceries } from '../hooks/useGroceries'
import { tick } from '../utils/haptics'
import type { GroceryItem } from '../types'

const categoryLabel: Record<GroceryItem['category'], string> = {
  dapur: 'Dapur',
  mandian: 'Mandian',
  lain: 'Lain',
}

export function GroceriesPage() {
  const { user } = useAuth()
  const { items, loading, addItem, toggleBought, removeItem, clearBought } = useGroceries()
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState('')
  const [category, setCategory] = useState<GroceryItem['category']>('dapur')
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const unbought = items.filter((i) => !i.isBought)
  const bought = items.filter((i) => i.isBought)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    try {
      await addItem({
        item: item.trim(),
        category,
        quantity: quantity.trim() || undefined,
        addedBy: user.uid,
      })
      setItem('')
      setQuantity('')
      setCategory('dapur')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen
      title="Senarai Runcit"
      action={
        <button
          onClick={() => setOpen(true)}
          className="press flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm shadow-neutral-900/20"
          aria-label="Tambah item"
        >
          <Plus className="h-5 w-5" strokeWidth={2} />
        </button>
      }
    >
      {loading && <ListSkeleton />}

      {!loading && items.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="Senarai kosong, tambah item"
          subtitle="Barang dapur, mandian, atau lain-lain"
        />
      )}

      {unbought.length > 0 && (
        <ul className="space-y-2">
          {unbought.map((i, idx) => (
            <GroceryRow key={i.id} item={i} index={idx} onToggle={toggleBought} onRemove={removeItem} />
          ))}
        </ul>
      )}

      {bought.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-400">Dah dibeli · {bought.length}</p>
            <button onClick={clearBought} className="press text-sm font-medium text-accent">
              Kosongkan
            </button>
          </div>
          <ul className="space-y-2">
            {bought.map((i, idx) => (
              <GroceryRow key={i.id} item={i} index={idx} onToggle={toggleBought} onRemove={removeItem} />
            ))}
          </ul>
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Tambah Item">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nama item</label>
            <input
              className={inputClass}
              required
              autoFocus
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="cth. Telur"
            />
          </div>
          <div>
            <label className={labelClass}>Kategori</label>
            <div className="flex gap-2">
              {(['dapur', 'mandian', 'lain'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={segmentClass(category === c)}
                  onClick={() => setCategory(c)}
                >
                  {categoryLabel[c]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Kuantiti (opsyenal)</label>
            <input
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="cth. 1 tray"
            />
          </div>
          <button type="submit" disabled={submitting || !item.trim()} className={primaryButtonClass}>
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Sheet>
    </Screen>
  )
}

function GroceryRow({
  item,
  index,
  onToggle,
  onRemove,
}: {
  item: GroceryItem
  index: number
  onToggle: (id: string, isBought: boolean) => void
  onRemove: (id: string) => void
}) {
  return (
    <li
      className="animate-fade-in-up flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5"
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <button
        onClick={() => {
          tick()
          onToggle(item.id, !item.isBought)
        }}
        className={`press flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          item.isBought ? 'border-accent bg-accent' : 'border-neutral-300'
        }`}
        aria-label={item.isBought ? 'Tanda belum beli' : 'Tanda dah beli'}
      >
        {item.isBought && <div className="animate-pop h-2 w-2 rounded-full bg-white" />}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[15px] font-medium transition-colors ${
            item.isBought ? 'text-neutral-400 line-through' : 'text-neutral-900'
          }`}
        >
          {item.item}
        </p>
        <p className="text-sm text-neutral-400">
          {categoryLabel[item.category]}
          {item.quantity && ` · ${item.quantity}`}
        </p>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-300 active:text-red-400"
        aria-label="Padam"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </li>
  )
}
