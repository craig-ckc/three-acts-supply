import { useRef, useState } from 'react'
import { easings, parseBezier, bezier, type Curve } from '../../data/easings'
import { formatNumber, type Dial, type Range } from '../../lib/extractDials'
import { Icon } from '../../data/icons'

const ROW = 'h-6 rounded-sm text-[11px]'
const DRAG_THRESHOLD = 3

/**
 * DialKit-style scrub slider: drag anywhere on the row to scrub (a plain click
 * does nothing, so double-click can open the text field without moving the value).
 */
export function NumberDial({ dial, range, onChange }: { dial: Dial; range: Range; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const gesture = useRef<{ x: number; dragging: boolean } | null>(null)
  const cancelEdit = useRef(false)
  const [editing, setEditing] = useState(false)
  const [active, setActive] = useState(false)
  const v = Number(dial.value)
  const span = range.max - range.min
  const pct = Math.max(0, Math.min(1, (v - range.min) / span))
  const bipolar = range.min < 0
  const zeroPct = bipolar ? -range.min / span : 0

  const commit = (n: number) => {
    const snapped = Math.round(n / range.step) * range.step
    onChange(formatNumber(Math.max(range.min, Math.min(range.max, snapped)), range.step) + dial.unit)
  }

  const fromPointer = (clientX: number) => {
    const box = ref.current!.getBoundingClientRect()
    commit(range.min + Math.max(0, Math.min(1, (clientX - box.left) / box.width)) * span)
  }

  const endGesture = () => {
    gesture.current = null
    setActive(false)
  }

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="slider"
      aria-label={dial.label}
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuenow={v}
      aria-valuetext={`${formatNumber(v, range.step)}${dial.unit}`}
      onPointerDown={(e) => {
        if (editing || e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        gesture.current = { x: e.clientX, dragging: false }
      }}
      onPointerMove={(e) => {
        const g = gesture.current
        if (!g) return
        if (!g.dragging && Math.abs(e.clientX - g.x) < DRAG_THRESHOLD) return
        g.dragging = true
        setActive(true)
        fromPointer(e.clientX)
      }}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      onLostPointerCapture={endGesture}
      onDoubleClick={() => setEditing(true)}
      onKeyDown={(e) => {
        const step = range.step * (e.shiftKey ? 10 : 1)
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') (e.preventDefault(), commit(v + step))
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') (e.preventDefault(), commit(v - step))
        if (e.key === 'Enter') setEditing(true)
      }}
      className={`group relative flex ${ROW} cursor-ew-resize select-none items-center overflow-hidden px-2 outline-none transition-colors ${
        active ? 'bg-white/[0.09]' : 'bg-white/[0.05] hover:bg-white/[0.07]'
      } focus-visible:ring-1 focus-visible:ring-lime/60`}
    >
      <span
        className={`absolute inset-y-0 transition-colors ${active ? 'bg-lime/25' : 'bg-white/[0.11] group-hover:bg-white/[0.15]'}`}
        style={{ left: `${Math.min(pct, zeroPct) * 100}%`, width: `${Math.abs(pct - zeroPct) * 100}%` }}
      />
      {bipolar && <span className="absolute inset-y-1.5 w-px bg-white/25" style={{ left: `${zeroPct * 100}%` }} />}
      <span
        className={`absolute inset-y-1 w-0.5 rounded-full ${active ? 'bg-lime' : 'bg-white/60'}`}
        style={{ left: `clamp(1px, calc(${pct * 100}% - 1px), calc(100% - 3px))` }}
      />
      <span className="relative flex-1 truncate text-white/70">{dial.label}</span>
      {editing ? (
        <input
          autoFocus
          inputMode="decimal"
          defaultValue={formatNumber(v, range.step)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => {
            setEditing(false)
            if (cancelEdit.current) return void (cancelEdit.current = false)
            const n = parseFloat(e.target.value)
            if (!isNaN(n)) commit(n)
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') {
              cancelEdit.current = true
              e.currentTarget.blur()
            }
          }}
          aria-label={`${dial.label} value`}
          className="relative w-14 rounded-sm bg-black/60 px-1 text-right font-mono text-[10.5px] text-white outline-none ring-1 ring-lime/50"
        />
      ) : (
        <span className="relative font-mono text-[10.5px] tabular-nums text-white">
          {formatNumber(v, range.step)}
          <span className="text-white/55">{dial.unit}</span>
        </span>
      )}
    </div>
  )
}

function expandHex(hex: string) {
  const h = hex.replace('#', '')
  if (h.length === 3 || h.length === 4) return '#' + h.slice(0, 3).split('').map((c) => c + c).join('')
  return '#' + h.slice(0, 6)
}

export function ColorDial({ dial, onChange }: { dial: Dial; onChange: (v: string) => void }) {
  const value = String(dial.value)
  return (
    <label className={`flex ${ROW} cursor-pointer items-center gap-2 bg-white/[0.05] pl-2 pr-1 hover:bg-white/[0.08]`}>
      <span className="flex-1 truncate text-white/70">{dial.label}</span>
      <span className="font-mono text-[10.5px] uppercase text-white">{value}</span>
      <span className="relative h-4 w-4 overflow-hidden rounded-sm ring-1 ring-inset ring-white/25" style={{ background: value }}>
        <input
          type="color"
          value={expandHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={`${dial.label} colour`}
        />
      </span>
    </label>
  )
}

function MiniCurve({ curve, className = 'h-5 w-5' }: { curve: Curve; className?: string }) {
  const [x1, y1, x2, y2] = curve
  return (
    <svg viewBox="-2 -6 24 32" className={className} preserveAspectRatio="none" aria-hidden>
      <path d={`M0 20 C ${x1 * 20} ${20 - y1 * 20} ${x2 * 20} ${20 - y2 * 20} 20 0`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function EasingDial({ dial, onChange }: { dial: Dial; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const curve = parseBezier(String(dial.value)) ?? [0.25, 0.1, 0.25, 1]
  const match = easings.find((e) => e.curve.every((n, i) => Math.abs(n - curve[i]) < 0.005))
  return (
    <div className="rounded-sm bg-white/[0.05]">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`flex ${ROW} w-full items-center gap-2 px-2 hover:bg-white/[0.04]`}>
        <span className="flex-1 truncate text-left text-white/70">{dial.label}</span>
        <span className="text-[10.5px] text-white">{match?.name ?? 'Custom'}</span>
        <MiniCurve curve={curve} className="h-3.5 w-3.5 text-lime" />
        <Icon name="chevron-right" className={`h-3 w-3 text-white/55 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-0.5 p-1 pt-0.5">
          {easings.map((e) => (
            <button
              key={e.name}
              onClick={() => onChange(bezier(e.curve))}
              className={`flex h-6 items-center gap-1.5 rounded-sm px-1.5 text-left text-[10.5px] ${match?.name === e.name ? 'bg-lime text-ink' : 'text-white/70 hover:bg-white/10'}`}
            >
              <MiniCurve curve={e.curve} className="h-3.5 w-3.5" />
              {e.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DialFolder({ title, count, children, defaultOpen = true }: { title: string; count: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} title={title} className="flex h-8 w-full items-center gap-1.5 px-2.5 text-left hover:bg-white/[0.03]">
        <Icon name="chevron-right" className={`h-3 w-3 text-white/55 transition-transform ${open ? 'rotate-90' : ''}`} />
        <span className="flex-1 truncate font-mono text-[10.5px] text-white/85">{title}</span>
        {!open && <span className="font-mono text-[10px] text-white/55">{count}</span>}
      </button>
      {open && <div className="space-y-1.5 px-2 pb-3 pt-0.5">{children}</div>}
    </div>
  )
}
