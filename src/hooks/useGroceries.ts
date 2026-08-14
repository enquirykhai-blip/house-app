import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { GroceryItem } from '../types'

export function useGroceries() {
  const [items, setItems] = useState<GroceryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'groceries'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GroceryItem))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addItem(input: {
    item: string
    category: GroceryItem['category']
    quantity?: string
    addedBy: string
  }) {
    await addDoc(collection(db, 'groceries'), {
      ...input,
      isBought: false,
      createdAt: Date.now(),
    })
  }

  async function toggleBought(id: string, isBought: boolean) {
    await updateDoc(doc(db, 'groceries', id), {
      isBought,
      boughtAt: isBought ? Date.now() : null,
    })
  }

  async function removeItem(id: string) {
    await deleteDoc(doc(db, 'groceries', id))
  }

  async function clearBought() {
    const bought = items.filter((i) => i.isBought)
    if (bought.length === 0) return
    const batch = writeBatch(db)
    for (const item of bought) {
      batch.delete(doc(db, 'groceries', item.id))
    }
    await batch.commit()
  }

  return { items, loading, addItem, toggleBought, removeItem, clearBought }
}
