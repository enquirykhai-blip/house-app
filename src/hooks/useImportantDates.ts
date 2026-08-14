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

  async function addDate(input: {
    title: string
    date: number
    category: ImportantDate['category']
    repeat: ImportantDate['repeat']
    notes?: string
    createdBy: string
  }) {
    await addDoc(collection(db, 'important_dates'), {
      ...input,
      createdAt: Date.now(),
    })
  }

  async function removeDate(id: string) {
    await deleteDoc(doc(db, 'important_dates', id))
  }

  return { dates, loading, addDate, removeDate }
}
