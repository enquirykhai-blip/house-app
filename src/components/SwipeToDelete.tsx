import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { tick } from '../utils/haptics'

const REVEAL = 76
const COMMIT_THRESHOLD = REVEAL * 0.65

interface SwipeToDeleteProps {
  onDelete: () => void
  children: ReactNode
}

export function SwipeToDelete({ onDelete, children }: SwipeToDeleteProps) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [removing, setRemoving] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const active = useRef(false)
  const axisLocked = useRef<'x' | 'y' | null>(null)

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startX.current = e.clientX
    startY.current = e.clientY
    active.current = true
    axisLocked.current = null
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!active.current) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current

    if (!axisLocked.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      if (Math.abs(dx) > Math.abs(dy)) {
        axisLocked.current = 'x'
        e.currentTarget.setPointerCapture(e.pointerId)
        setDragging(true)
      } else {
        active.current = false
        return
      }
    }

    if (axisLocked.current === 'x') {
      setDragX(Math.min(0, Math.max(dx, -REVEAL * 1.4)))
    }
  }

  function finishDrag() {
    if (!active.current) return
    active.current = false
    setDragging(false)
    if (dragX < -COMMIT_THRESHOLD) {
      tick()
      setRemoving(true)
      setDragX(-500)
      setTimeout(onDelete, 180)
    } else {
      setDragX(0)
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${removing ? 'pointer-events-none' : ''}`}>
      <div className="absolute inset-0 flex items-center justify-end bg-danger px-6">
        <Trash2 className="h-5 w-5 text-white" strokeWidth={1.75} />
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  )
}
