import { useCallback, useState } from 'react'

/**
 * Pointer drag helper that keeps tracking even when the cursor crosses an
 * iframe: it captures the pointer on the handle and exposes the active cursor
 * so the caller can mount a full-screen shield above the preview.
 */
export function useDragGesture() {
  const [cursor, setCursor] = useState<string | null>(null)

  const start = useCallback((e: React.PointerEvent, cursorStyle: string, onMove: (dx: number, dy: number) => void) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    const startX = e.clientX
    const startY = e.clientY
    try {
      target.setPointerCapture(e.pointerId)
    } catch {
      /* capture is best-effort; the shield covers the iframe either way */
    }
    setCursor(cursorStyle)

    const move = (ev: PointerEvent) => onMove(ev.clientX - startX, ev.clientY - startY)
    const end = () => {
      setCursor(null)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }, [])

  return { cursor, start }
}
