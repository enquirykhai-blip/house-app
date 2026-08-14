import { useState, type FormEvent } from 'react'
import { Heart, Plus, ShoppingCart } from 'lucide-react'
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
import { useGroceries } from '../hooks/useGroceries'
import { useActivity } from '../hooks/useActivity'
import { useAutoOpenAdd } from '../hooks/useAutoOpenAdd'
import { tick } from '../utils/haptics'
import type { GroceryItem } from '../types'
import type { TranslationKey } from '../i18n/translations'

const categoryKey: Record<GroceryItem['category'], TranslationKey> = {
  dapur: 'categoryDapur',
  mandian: 'categoryMandian',
  lain: 'categoryLain',
}

export function GroceriesPage() {
  const { user, displayName, favoriteGroceries, toggleFavoriteGrocery } = useAuth()
  const { t } = useLanguage()
  const { items, loading, refreshing, refresh, addItem, toggleBought, removeItem, clearBought } =
    useGroceries()
  const { logActivity } = useActivity()
  const { pending, requestDelete } = useUndo()
  const [open, setOpen] = useState(false)
  const [item, setItem] = useState('')
  const [category, setCategory] = useState<GroceryItem['category']>('dapur')
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useAutoOpenAdd(() => setOpen(true))

  // Hide the item immediately once its delete is scheduled; if Undo is
  // pressed, `pending` clears and it reappears since it was never actually
  // removed from Firestore.
  const visible = items.filter((i) => pending?.key !== `grocery-${i.id}`)
  const unbought = visible.filter((i) => !i.isBought)
  const bought = visible.filter((i) => i.isBought)

  async function addNamedItem(name: string, cat: GroceryItem['category']) {
    if (!user) return
    await addItem({ item: name, category: cat, addedBy: user.uid })
    if (displayName) await logActivity(user.uid, displayName, 'grocery_added', name)
  }

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
      if (displayName) await logActivity(user.uid, displayName, 'grocery_added', item.trim())
      setItem('')
      setQuantity('')
      setCategory('dapur')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  function handleToggle(i: GroceryItem, isBought: boolean) {
    tick()
    toggleBought(i.id, isBought)
    if (isBought && displayName && user) {
      logActivity(user.uid, displayName, 'grocery_bought', i.item)
    }
  }

  function handleDelete(i: GroceryItem) {
    requestDelete(`grocery-${i.id}`, i.item, () => removeItem(i.id))
  }

  return (
    <Screen
      title={t('groceriesPageTitle')}
      action={
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={refresh} refreshing={refreshing} />
          <button
            onClick={() => setOpen(true)}
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
            aria-label={t('addGroceryItem')}
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      }
    >
      {loading && <ListSkeleton />}

      {favoriteGroceries.length > 0 && (
        <div className="no-scrollbar mb-4 -mx-5 flex gap-2 overflow-x-auto px-5">
          {favoriteGroceries.map((f) => (
            <button
              key={`${f.name}-${f.category}`}
              onClick={() => addNamedItem(f.name, f.category)}
              className="press flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[13px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            >
              <Plus className="h-3.5 w-3.5 text-accent" strokeWidth={2.25} />
              {f.name}
            </button>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState icon={ShoppingCart} title={t('groceriesEmptyTitle')} subtitle={t('groceriesEmptySubtitle')} />
      )}

      {unbought.length > 0 && (
        <ul className="space-y-2">
          {unbought.map((i, idx) => (
            <GroceryRow
              key={i.id}
              item={i}
              index={idx}
              isFavorite={favoriteGroceries.some((f) => f.name === i.item && f.category === i.category)}
              onToggle={handleToggle}
              onToggleFavorite={() => toggleFavoriteGrocery({ name: i.item, category: i.category })}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {bought.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-400">{t('boughtCount', { count: bought.length })}</p>
            <button onClick={clearBought} className="press text-sm font-medium text-accent">
              {t('clearBought')}
            </button>
          </div>
          <ul className="space-y-2">
            {bought.map((i, idx) => (
              <GroceryRow
                key={i.id}
                item={i}
                index={idx}
                isFavorite={favoriteGroceries.some((f) => f.name === i.item && f.category === i.category)}
                onToggle={handleToggle}
                onToggleFavorite={() => toggleFavoriteGrocery({ name: i.item, category: i.category })}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </div>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={t('addItemTitle')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{t('fieldItemName')}</label>
            <input
              className={inputClass}
              required
              autoFocus
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder={t('itemPlaceholder')}
            />
          </div>
          <div>
            <label className={labelClass}>{t('fieldCategory')}</label>
            <div className="flex gap-2">
              {(['dapur', 'mandian', 'lain'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={segmentClass(category === c)}
                  onClick={() => setCategory(c)}
                >
                  {t(categoryKey[c])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>{t('fieldQuantity', { optional: t('optional') })}</label>
            <input
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t('quantityPlaceholder')}
            />
          </div>
          <button type="submit" disabled={submitting || !item.trim()} className={primaryButtonClass}>
            {submitting ? t('saving') : t('save')}
          </button>
        </form>
      </Sheet>
    </Screen>
  )
}

function GroceryRow({
  item,
  index,
  isFavorite,
  onToggle,
  onToggleFavorite,
  onDelete,
}: {
  item: GroceryItem
  index: number
  isFavorite: boolean
  onToggle: (item: GroceryItem, isBought: boolean) => void
  onToggleFavorite: () => void
  onDelete: (item: GroceryItem) => void
}) {
  const { t } = useLanguage()
  return (
    <li
      className="animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <SwipeToDelete onDelete={() => onDelete(item)}>
        <div className="flex items-center gap-3 border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
          <button
            onClick={() => onToggle(item, !item.isBought)}
            className={`press flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              item.isBought ? 'border-accent bg-accent' : 'border-neutral-300 dark:border-neutral-600'
            }`}
            aria-label={item.isBought ? t('markUnbought') : t('markBought')}
          >
            {item.isBought && <div className="animate-pop h-2 w-2 rounded-full bg-white" />}
          </button>
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-[15px] font-medium transition-colors ${
                item.isBought
                  ? 'text-neutral-400 line-through'
                  : 'text-neutral-900 dark:text-neutral-50'
              }`}
            >
              {item.item}
            </p>
            <p className="text-sm text-neutral-400">
              {t(categoryKey[item.category])}
              {item.quantity && ` · ${item.quantity}`}
            </p>
          </div>
          <button
            onClick={onToggleFavorite}
            className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-300 dark:text-neutral-600"
            aria-label={isFavorite ? t('unmarkFavorite') : t('markFavorite')}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-accent text-accent' : ''}`}
              strokeWidth={1.75}
            />
          </button>
        </div>
      </SwipeToDelete>
    </li>
  )
}
