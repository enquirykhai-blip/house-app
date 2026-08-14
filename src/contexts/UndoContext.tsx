import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface PendingUndo {
  key: string
  label: string
  commit: () => void | Promise<void>
}

interface UndoContextValue {
  pending: PendingUndo | null
  requestDelete: (key: string, label: string, commit: () => void | Promise<void>) => void
  undo: () => void
}

const UndoContext = createContext<UndoContextValue | undefined>(undefined)

const DURATION = 5000

export function UndoProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingUndo | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<PendingUndo | null>(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const commitNow = useCallback(() => {
    clearTimer()
    const current = pendingRef.current
    pendingRef.current = null
    setPending(null)
    if (current) void current.commit()
  }, [clearTimer])

  const requestDelete = useCallback(
    (key: string, label: string, commit: () => void | Promise<void>) => {
      // Only one undo-able action at a time — commit whatever was pending before.
      commitNow()
      const next: PendingUndo = { key, label, commit }
      pendingRef.current = next
      setPending(next)
      timeoutRef.current = setTimeout(commitNow, DURATION)
    },
    [commitNow],
  )

  const undo = useCallback(() => {
    clearTimer()
    pendingRef.current = null
    setPending(null)
  }, [clearTimer])

  return (
    <UndoContext.Provider value={{ pending, requestDelete, undo }}>
      {children}
    </UndoContext.Provider>
  )
}

export function useUndo() {
  const ctx = useContext(UndoContext)
  if (!ctx) throw new Error('useUndo must be used within UndoProvider')
  return ctx
}
