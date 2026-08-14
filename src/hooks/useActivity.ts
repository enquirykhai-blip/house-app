import { useEffect, useState } from 'react'
import { addDoc, collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Activity } from '../types'

export function useActivity(max = 8) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'activity'), orderBy('createdAt', 'desc'), limit(max))
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Activity))
      setLoading(false)
    })
    return unsub
  }, [max])

  async function logActivity(actorUid: string, actorName: string, action: string) {
    await addDoc(collection(db, 'activity'), {
      actorUid,
      actorName,
      action,
      createdAt: Date.now(),
    })
  }

  return { activities, loading, logActivity }
}
