import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Side = 'top' | 'bottom' | 'right'

/**
 * Lightweight tooltip rendered in a portal (never clipped by overflow-hidden
 * panels) with a fixed side — no flipping onto the trigger it describes.
 */
export function Tooltip({
  label,
  shortcut,
  side = 'bottom',
  className = 'inline-flex',
  children,
}: {
  label: string
  shortcut?: string
  side?: Side
  className?: string
  children: React.ReactNode
}) {
  const anchor = useRef<HTMLSpanElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ left: 0, top: 0 })

  const show = (delay: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), delay)
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    setOpen(false)
  }

  useLayoutEffect(() => {
    if (!open || !anchor.current || !tip.current) return
    const a = anchor.current.getBoundingClientRect()
    const t = tip.current.getBoundingClientRect()
    const gap = 6
    let left = side === 'right' ? a.right + gap : a.left + a.width / 2 - t.width / 2
    let top = side === 'right' ? a.top + a.height / 2 - t.height / 2 : side === 'top' ? a.top - t.height - gap : a.bottom + gap
    left = Math.max(8, Math.min(window.innerWidth - t.width - 8, left))
    top = Math.max(8, Math.min(window.innerHeight - t.height - 8, top))
    setPos({ left, top })
  }, [open, side])

  return (
    <span
      ref={anchor}
      className={className}
      onPointerEnter={() => show(350)}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={(e) => e.target.matches(':focus-visible') && show(0)}
      onBlur={hide}
    >
      {children}
      {open &&
        createPortal(
          <div
            ref={tip}
            role="tooltip"
            className="pointer-events-none fixed z-[100] flex items-center gap-1.5 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11.5px] leading-4 text-paper shadow-[0_4px_12px_-4px_rgba(0,0,0,0.35)]"
            style={pos}
          >
            {label}
            {shortcut && <kbd className="rounded-sm bg-white/12 px-1 font-mono text-[10px] text-white/70">{shortcut}</kbd>}
          </div>,
          document.body,
        )}
    </span>
  )
}
