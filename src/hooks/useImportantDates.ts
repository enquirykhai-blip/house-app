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
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { ImportantDate } from '../types'
import { nextOccurrence, startOfDay } from '../utils/date'

type DateInput = {
  title: string
  date: number
  category: string
  repeat: ImportantDate['repeat']
  notes?: string
}

export function useImportantDates() {
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'important_dates'), orderBy('date', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ImportantDate)
      setDates(list)
      setLoading(false)

      // Roll repeating dates that have passed to their next occurrence.
      const today = startOfDay(Date.now())
      for (const item of list) {
        if (item.repeat === 'none') continue
        if (item.date >= today) continue
        const next = nextOccurrence(item.date, item.repeat)
        if (next !== item.date) {
          updateDoc(doc(db, 'important_dates', item.id), { date: next }).catch(() => {})
        }
      }
    })
    return unsub
  }, [])

  async function addDate(input: DateInput & { createdBy: string }) {
    await addDoc(collection(db, 'important_dates'), {
      title: input.title,
      date: input.date,
      category: input.category,
      repeat: input.repeat,
      notes: input.notes ?? null,
      createdBy: input.createdBy,
      createdAt: Date.now(),
    })
  }

  async function updateDate(id: string, input: DateInput) {
    await updateDoc(doc(db, 'important_dates', id), {
      title: input.title,
      date: input.date,
      category: input.category,
      repeat: input.repeat,
      notes: input.notes ?? null,
    })
  }

  async function removeDate(id: string) {
    await deleteDoc(doc(db, 'important_dates', id))
  }

  return { dates, loading, addDate, updateDate, removeDate }
}
