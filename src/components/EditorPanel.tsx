import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { html as htmlLang } from '@codemirror/lang-html'
import { css as cssLang } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import type { Resource } from '../data/resources'
import { applyDial, extractCssDials, extractHtmlDials, rangeFor, type Dial, type Range } from '../lib/extractDials'
import { copyText } from '../lib/clipboard'
import { vaultTheme } from '../lib/editorTheme'
import { useDragGesture } from '../lib/useDragGesture'
import { Icon } from '../data/icons'
import { ColorDial, DialFolder, EasingDial, NumberDial } from './dials/Dials'
import { Scroll } from './Scroll'
import { Tooltip } from './ui'

export type Code = { html: string; css: string; js: string }
type Tab = 'props' | 'html' | 'css' | 'js' | 'info'
type CodeTab = 'html' | 'css' | 'js'

const TABS: { key: Tab; label: string }[] = [
  { key: 'props', label: 'Props' },
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'js', label: 'JS' },
  { key: 'info', label: 'Info' },
]
const FILE: Record<CodeTab, string> = { html: 'index.html', css: 'style.css', js: 'script.js' }

export const VIEWPORTS = [
  { icon: 'monitor', label: 'Desktop', width: '100%' },
  { icon: 'tablet', label: 'Tablet', width: '768px' },
  { icon: 'phone', label: 'Mobile', width: '390px' },
]

const INSET = 8
const MIN_W = 320
const MIN_H = 240

/** Panel geometry stored as insets from the container's right/top/bottom edges plus a width,
 *  so the default "docked right, full height" layout follows the window as it resizes. */
interface Rect {
  right: number
  top: number
  bottom: number
  width: number
}

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
const EDGE_CURSOR: Record<Edge, string> = { n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize' }
const EDGE_CLASS: Record<Edge, string> = {
  n: 'left-3 right-3 -top-1 h-2',
  s: 'left-3 right-3 -bottom-1 h-2',
  w: 'top-3 bottom-3 -left-1 w-2',
  e: 'top-3 bottom-3 -right-1 w-2',
  nw: '-left-1 -top-1 h-4 w-4',
  ne: '-right-1 -top-1 h-4 w-4',
  sw: '-left-1 -bottom-1 h-4 w-4',
  se: '-right-1 -bottom-1 h-4 w-4',
}
/** Hairline shown on hover so edges read as grabbable. */
const EDGE_LINE: Partial<Record<Edge, string>> = {
  n: 'inset-x-0 top-1 h-px',
  s: 'inset-x-0 bottom-1 h-px',
  w: 'inset-y-0 left-1 w-px',
  e: 'inset-y-0 right-1 w-px',
}

interface Props {
  resource: Resource
  code: Code
  setCode: React.Dispatch<React.SetStateAction<Code>>
  dirty: boolean
  onReset: () => void
  onDownload: () => void
  /** Files that would be downloaded, e.g. ['index.html', 'style.css']. */
  files: string[]
  minimized: boolean
  setMinimized: (v: boolean) => void
  hidden?: boolean
  /** Reports how many px of the canvas' right side the panel covers (0 when minimized/hidden). */
  onOccupy?: (px: number) => void
  // Preview & navigation controls
  viewport: number
  setViewport: (i: number) => void
  onReload: () => void
  onOpenTab: () => void
  saved: boolean
  onToggleSave: () => void
  onImmersive: () => void
  onBack: () => void
  prevTitle: string
  nextTitle: string
  onPrev: () => void
  onNext: () => void
}

/** Folder titles come straight from the source: drop CSS comments and name @-rules plainly. */
function folderTitle(raw: string) {
  const t = raw
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/@(import|charset)\b(?:url\([^)]*\)|"[^"]*"|'[^']*'|[^;])*;?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return t || (/@import/.test(raw) ? 'Imports' : raw)
}

/** shape: 'md' for loose buttons, 'inset' inside a 2px-padded group (radius nests to 4px), 'round' inside the pill. */
function Btn({
  icon,
  label,
  shortcut,
  onClick,
  active,
  size = 'sm',
  shape = 'md',
}: {
  icon: string
  label: string
  shortcut?: string
  onClick: () => void
  active?: boolean
  size?: 'sm' | 'md'
  shape?: 'md' | 'inset' | 'round'
}) {
  const radius = shape === 'round' ? 'rounded-full' : shape === 'inset' ? 'rounded-sm' : 'rounded-md'
  return (
    <Tooltip label={label} shortcut={shortcut}>
      <button
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={`grid shrink-0 place-items-center transition-colors ${radius} ${size === 'md' ? 'h-7 w-7' : 'h-6 w-6'} ${
          active ? 'bg-white/[0.14] text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon name={icon} className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  )
}

export function EditorPanel(props: Props) {
  const { resource, code, setCode, dirty, onReset, onDownload, files, minimized, setMinimized, hidden = false, onOccupy } = props
  const [tab, setTab] = useState<Tab>('props')
  const [rect, setRect] = useState<Rect>({ right: INSET, top: INSET, bottom: INSET, width: 380 })
  const panelRef = useRef<HTMLDivElement>(null)
  const ranges = useRef(new Map<string, Range>())
  const gesture = useDragGesture()

  const extensions = useMemo(() => ({ html: [htmlLang(), EditorView.lineWrapping], css: [cssLang(), EditorView.lineWrapping], js: [javascript(), EditorView.lineWrapping] }), [])

  // Re-derived from the live code each render so offsets always line up with the source.
  const cssDials = useMemo(() => extractCssDials(code.css, code.js), [code.css, code.js])
  const htmlDials = useMemo(() => extractHtmlDials(code.html), [code.html])
  // When a resource names its knobs as custom properties, those (plus data-* attributes) are the
  // panel; incidental values like body padding stay behind "Show all values".
  const [showAll, setShowAll] = useState(false)
  const curated = useMemo(() => cssDials.filter((d) => d.label.startsWith('--')), [cssDials])
  const hasCurated = curated.length > 0
  const visible = hasCurated && !showAll ? [...htmlDials, ...curated] : [...htmlDials, ...cssDials]
  const hiddenCount = cssDials.length - curated.length
  const folders = useMemo(() => {
    const m = new Map<string, Dial[]>()
    visible.forEach((d) => m.set(d.folder, [...(m.get(d.folder) ?? []), d]))
    return [...m.entries()]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cssDials, htmlDials, showAll])

  const rangeOf = (d: Dial) => {
    if (!ranges.current.has(d.key)) ranges.current.set(d.key, rangeFor(d))
    return ranges.current.get(d.key)!
  }
  const update = (d: Dial, next: string) => setCode((c) => ({ ...c, [d.source]: applyDial(c[d.source], d, next) }))

  const container = () => panelRef.current?.parentElement?.getBoundingClientRect() ?? { width: window.innerWidth, height: window.innerHeight }
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  // Keep the panel inside the canvas when the window (or sidebar) changes size.
  useEffect(() => {
    const parent = panelRef.current?.parentElement
    if (!parent) return
    const ro = new ResizeObserver(([entry]) => {
      const { width: cw, height: ch } = entry.contentRect
      setRect((r) => {
        const width = Math.min(r.width, Math.max(MIN_W, cw - 2 * INSET))
        const right = clamp(r.right, 0, Math.max(0, cw - width))
        let { top, bottom } = r
        if (ch - top - bottom < MIN_H) {
          top = Math.max(0, Math.min(top, ch - MIN_H - INSET))
          bottom = Math.max(0, ch - top - MIN_H)
        }
        return width === r.width && right === r.right && top === r.top && bottom === r.bottom ? r : { width, right, top, bottom }
      })
    })
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    onOccupy?.(hidden || minimized ? 0 : rect.right + rect.width + INSET)
  }, [onOccupy, hidden, minimized, rect.right, rect.width])

  /** Drag from the header to move; size is preserved. */
  const startMove = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a')) return
    const o = rect
    const { width: cw, height: ch } = container()
    const h = ch - o.top - o.bottom
    gesture.start(e, 'grabbing', (dx, dy) => {
      const top = clamp(o.top + dy, 0, ch - h)
      setRect({ width: o.width, right: clamp(o.right - dx, 0, cw - o.width), top, bottom: ch - top - h })
    })
  }

  const startResize = (edge: Edge) => (e: React.PointerEvent) => {
    const o = rect
    const { width: cw, height: ch } = container()
    gesture.start(e, EDGE_CURSOR[edge], (dx, dy) => {
      const next = { ...o }
      if (edge.includes('n')) next.top = clamp(o.top + dy, 0, ch - o.bottom - MIN_H)
      if (edge.includes('s')) next.bottom = clamp(o.bottom - dy, 0, ch - o.top - MIN_H)
      if (edge.includes('w')) next.width = clamp(o.width - dx, MIN_W, cw - o.right)
      if (edge.includes('e')) {
        next.right = clamp(o.right - dx, 0, o.right + o.width - MIN_W)
        next.width = o.width + (o.right - next.right)
      }
      setRect(next)
    })
  }

  /** The minimized pill: drag to slide it along the top, click to restore. */
  const pillPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    const o = rect
    const { width: cw } = container()
    const pillWidth = (e.currentTarget as HTMLElement).offsetWidth
    let moved = false
    gesture.start(e, 'grabbing', (dx) => {
      if (Math.abs(dx) > 3) moved = true
      if (moved) setRect({ ...o, right: clamp(o.right - dx, 0, cw - pillWidth) })
    })
    const up = () => {
      window.removeEventListener('pointerup', up)
      if (!moved) setMinimized(false)
    }
    window.addEventListener('pointerup', up)
  }

  const hide = hidden ? 'pointer-events-none invisible opacity-0' : ''
  const shield =
    gesture.cursor && createPortal(<div style={{ position: 'fixed', inset: 0, zIndex: 2147483647, cursor: gesture.cursor }} />, document.body)

  if (minimized) {
    return (
      <>
        {shield}
        <div
          ref={panelRef}
          onPointerDown={pillPointerDown}
          title="Click to restore, drag to move"
          className={`dark-scroll absolute z-30 flex h-9 cursor-pointer select-none items-center gap-0.5 rounded-full border border-white/10 bg-panel px-1.5 text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] transition-opacity duration-300 ${hide}`}
          style={{ right: rect.right, top: INSET }}
        >
          <Btn shape="round" icon="arrow-left" label={`Back to ${resource.category}`} onClick={props.onBack} />
          <span className="max-w-[240px] truncate px-1.5 text-[12px] font-medium">{resource.title}</span>
          {dirty && <span className="mr-1 h-2 w-2 shrink-0 rounded-full bg-violet-soft" aria-label="Edited" />}
          <span className="mx-0.5 h-4 w-px bg-white/10" />
          <Btn shape="round" icon="expand" label="Immersive" shortcut="F" onClick={props.onImmersive} />
          <Btn shape="round" icon="panel" label="Restore panel" shortcut="E" onClick={() => setMinimized(false)} />
        </div>
      </>
    )
  }

  return (
    <>
      {shield}
      <div
        ref={panelRef}
        className={`absolute z-30 transition-opacity duration-300 ${hide}`}
        style={{ right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, maxWidth: `calc(100% - ${rect.right}px)` }}
      >
        <div className="dark-scroll flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel text-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.45)]">
          {/* Header — drag handle */}
          <div onPointerDown={startMove} className="flex h-11 shrink-0 cursor-grab items-center gap-1 pl-2 pr-2 active:cursor-grabbing">
            <Btn size="md" icon="arrow-left" label={`Back to ${resource.category}`} onClick={props.onBack} />
            <div className="min-w-0 flex-1 px-1" title={resource.title}>
              <p className="truncate text-[13px] font-medium leading-tight">{resource.title}</p>
              <p className="truncate text-[11px] leading-tight text-white/55">{resource.category}</p>
            </div>
            {dirty && (
              <Tooltip label="Discard all edits">
                <button onClick={onReset} className="flex h-6 items-center gap-1.5 rounded-md bg-violet/20 px-2 text-[11px] text-violet-soft hover:bg-violet/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-soft" />
                  Edited · Reset
                </button>
              </Tooltip>
            )}
            <Btn size="md" icon="minus" label="Minimize" shortcut="E" onClick={() => setMinimized(true)} />
          </div>

          {/* Preview & navigation controls */}
          <div className="flex h-10 shrink-0 items-center gap-1 border-y border-white/[0.07] px-2">
            <div className="flex gap-px rounded-md bg-white/[0.05] p-0.5" role="radiogroup" aria-label="Preview width">
              {VIEWPORTS.map((v, i) => (
                <Btn key={v.label} shape="inset" icon={v.icon} label={v.label} active={props.viewport === i} onClick={() => props.setViewport(i)} />
              ))}
            </div>
            <Btn size="md" icon="refresh" label="Reload preview" onClick={props.onReload} />
            <Btn size="md" icon="external" label="Open in new tab" onClick={props.onOpenTab} />
            <span className="flex-1" />
            <Btn size="md" icon="chevron-left" label={props.prevTitle} shortcut="[" onClick={props.onPrev} />
            <Btn size="md" icon="chevron-right" label={props.nextTitle} shortcut="]" onClick={props.onNext} />
            <span className="mx-0.5 h-4 w-px bg-white/10" />
            <Btn size="md" icon="bookmark" label={props.saved ? 'Remove bookmark' : 'Bookmark'} active={props.saved} onClick={props.onToggleSave} />
            <Btn size="md" icon="expand" label="Immersive" shortcut="F" onClick={props.onImmersive} />
          </div>

          {/* Tabs */}
          <div className="mx-2 mt-2 flex shrink-0 gap-px rounded-md bg-white/[0.05] p-0.5" role="tablist">
            {TABS.map((t) => {
              const empty = (t.key === 'html' || t.key === 'css' || t.key === 'js') && !code[t.key].trim()
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex h-6 flex-1 items-center justify-center gap-1 rounded-sm text-[11.5px] transition-colors ${
                    tab === t.key ? 'bg-white/[0.13] text-white' : empty ? 'text-white/40 hover:text-white/70' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {t.label}
                  {empty && <span className="text-[10px] text-white/40">—</span>}
                </button>
              )
            })}
          </div>

          {/* Body */}
          <div className="mt-2 min-h-0 flex-1 overflow-hidden">
            {tab === 'props' && (
              <Scroll tone="dark" className="h-full">
                <div className="pr-1">
                  {folders.length === 0 && <p className="p-6 text-center text-[12px] text-white/55">No tweakable values in this resource.</p>}
                  {folders.map(([folder, dials], i) => (
                    <DialFolder key={folder} title={folderTitle(folder)} count={dials.length} defaultOpen={i < 3}>
                      {dials.map((d) =>
                        d.kind === 'color' ? (
                          <ColorDial key={d.key} dial={d} onChange={(v) => update(d, v)} />
                        ) : d.kind === 'easing' ? (
                          <EasingDial key={d.key} dial={d} onChange={(v) => update(d, v)} />
                        ) : (
                          <NumberDial key={d.key} dial={d} range={rangeOf(d)} onChange={(v) => update(d, v)} />
                        ),
                      )}
                    </DialFolder>
                  ))}
                  {hasCurated && hiddenCount > 0 && (
                    <button
                      onClick={() => setShowAll((v) => !v)}
                      className="mx-2.5 my-3 flex h-6 items-center gap-1.5 rounded-md px-1.5 text-[11px] text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <Icon name={showAll ? 'minus' : 'plus'} className="h-3 w-3" />
                      {showAll ? 'Show key values only' : `Show all values (${hiddenCount} more)`}
                    </button>
                  )}
                </div>
              </Scroll>
            )}

            {(tab === 'html' || tab === 'css' || tab === 'js') && (
              <div className="flex h-full flex-col border-t border-white/[0.07]">
                <div className="flex h-8 shrink-0 items-center gap-2 border-b border-white/[0.07] px-3">
                  <span className="flex-1 font-mono text-[11px] text-white/60">{FILE[tab]}</span>
                  <button
                    onClick={() => copyText(code[tab], FILE[tab])}
                    disabled={!code[tab].trim()}
                    className="flex h-6 items-center gap-1.5 rounded-md px-2 text-[11px] text-white/70 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-35"
                  >
                    <Icon name="copy" className="h-3 w-3" /> Copy
                  </button>
                </div>
                <div className="min-h-0 flex-1">
                  <CodeMirror
                    key={tab}
                    value={code[tab]}
                    height="100%"
                    className="h-full"
                    theme={vaultTheme}
                    extensions={extensions[tab]}
                    basicSetup={{ foldGutter: false, highlightActiveLineGutter: true }}
                    onChange={(value) => setCode((c) => ({ ...c, [tab]: value }))}
                    placeholder={`${FILE[tab]} is empty — type to add some`}
                  />
                </div>
              </div>
            )}

            {tab === 'info' && (
              <Scroll tone="dark" className="h-full">
                <div className="space-y-4 px-3 pb-4 pt-1">
                  <p className="text-[12.5px] leading-relaxed text-white/75">{resource.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {resource.free && <span className="rounded-sm bg-lime px-1.5 py-0.5 text-[11px] font-medium text-ink">Free</span>}
                    {resource.tags.map((t) => (
                      <span key={t} className="rounded-sm bg-white/[0.08] px-1.5 py-0.5 text-[11px] text-white/75">
                        {t}
                      </span>
                    ))}
                  </div>
                  {resource.libs && resource.libs.length > 0 && (
                    <p className="flex items-center gap-2 text-[12px] text-white/60">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
                      <span>
                        Requires <span className="text-white">GSAP 3.13</span>
                        {resource.libs.filter((l) => l !== 'gsap').length > 0 && ` with ${resource.libs.filter((l) => l !== 'gsap').join(', ')}`}
                      </span>
                    </p>
                  )}
                  <div className="border-t border-white/[0.07] pt-4">
                    <div className="mb-2.5 flex flex-wrap gap-1">
                      {files.map((f) => (
                        <span key={f} className="rounded-sm border border-white/10 px-1.5 py-0.5 font-mono text-[10.5px] text-white/70">
                          {f}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={onDownload}
                      disabled={files.length === 0}
                      className="flex h-7 items-center gap-1.5 rounded-md bg-lime px-2.5 text-[12px] font-medium text-ink transition hover:brightness-95 disabled:opacity-40"
                    >
                      <Icon name="download" className="h-3.5 w-3.5" />
                      {files.length > 1 ? `Download ${files.length} files (.zip)` : 'Download file'}
                    </button>
                  </div>
                </div>
              </Scroll>
            )}
          </div>
        </div>

        {/* Resize handles on every edge and corner */}
        {(Object.keys(EDGE_CLASS) as Edge[]).map((edge) => (
          <div key={edge} onPointerDown={startResize(edge)} className={`group/edge absolute z-10 touch-none ${EDGE_CLASS[edge]}`} style={{ cursor: EDGE_CURSOR[edge] }} aria-hidden>
            {EDGE_LINE[edge] && <span className={`absolute bg-lime/0 transition-colors group-hover/edge:bg-lime/50 ${EDGE_LINE[edge]}`} />}
          </div>
        ))}
      </div>
    </>
  )
}
