import { useEffect, useState } from 'react'
import { addDoc, collection, getDocs, onSnapshot, orderBy, query, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Activity, ActivityType } from '../types'

const KEEP = 3

/**
 * Deletes anything beyond the {KEEP} most recent activity entries, plus any
 * pre-migration entries (old {action: string} shape, no `type` field) which
 * can never render and would otherwise sit invisible forever.
 */
async function trimActivity() {
  const snap = await getDocs(query(collection(db, 'activity'), orderBy('createdAt', 'desc')))
  const legacy = snap.docs.filter((d) => !('type' in d.data()))
  const excess = snap.docs.filter((d) => 'type' in d.data()).slice(KEEP)
  const toDelete = [...legacy, ...excess]
  if (toDelete.length === 0) return
  const batch = writeBatch(db)
  for (const d of toDelete) batch.delete(d.ref)
  await batch.commit()
}

export function useActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'activity'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.slice(0, KEEP).map((d) => ({ id: d.id, ...d.data() }) as Activity))
      setLoading(false)
    })
    trimActivity().catch(() => {})
    return unsub
  }, [])

  async function logActivity(actorUid: string, actorName: string, type: ActivityType, detail: string) {
    await addDoc(collection(db, 'activity'), {
      actorUid,
      actorName,
      type,
      detail,
      createdAt: Date.now(),
    })
    trimActivity().catch(() => {})
  }

  return { activities, loading, logActivity }
}
