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
import type { Person, Task } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Task))
      setLoading(false)
    })
    return unsub
  }, [])

  async function addTask(input: {
    title: string
    assignedTo: Person
    dueDate?: number
    createdBy: string
  }) {
    await addDoc(collection(db, 'tasks'), {
      title: input.title,
      assignedTo: input.assignedTo,
      dueDate: input.dueDate ?? null,
      createdBy: input.createdBy,
      isDone: false,
      createdAt: Date.now(),
    })
  }

  async function toggleDone(id: string, isDone: boolean) {
    await updateDoc(doc(db, 'tasks', id), {
      isDone,
      completedAt: isDone ? Date.now() : null,
    })
  }

  async function removeTask(id: string) {
    await deleteDoc(doc(db, 'tasks', id))
  }

  return { tasks, loading, addTask, toggleDone, removeTask }
}
