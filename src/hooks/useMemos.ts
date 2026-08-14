import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Memo, MemoColor } from '../types'

export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'memos'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setMemos(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Memo))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addMemo(input: {
    text: string
    color: MemoColor
    authorUid: string
    authorName: string
  }) {
    await addDoc(collection(db, 'memos'), {
      ...input,
      createdAt: Date.now(),
    })
  }

  async function removeMemo(id: string) {
    await deleteDoc(doc(db, 'memos', id))
  }

  return { memos, loading, addMemo, removeMemo }
}
