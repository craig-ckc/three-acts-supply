import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getResource, resources, type Resource } from '../data/resources'
import { favorites, recents } from '../lib/store'
import { buildSrcDoc } from '../lib/buildSrcDoc'
import { downloadSource, presentFiles } from '../lib/download'
import { notify } from '../lib/clipboard'
import NotFound from './NotFound'
import { Icon } from '../data/icons'
import { useShell } from '../components/shell/AppShell'
import { LivePreview } from '../components/LivePreview'
import { EditorPanel, VIEWPORTS, type Code } from '../components/EditorPanel'

function Workspace({ resource }: { resource: Resource }) {
  const initial = useMemo<Code>(() => ({ html: resource.html, css: resource.css, js: resource.js }), [resource])
  const [code, setCode] = useState<Code>(initial)
  const [viewport, setViewport] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [occupied, setOccupied] = useState(0)
  const [hint, setHint] = useState(false)
  const { immersive, setImmersive } = useShell()
  const favs = favorites.use()
  const saved = favs.includes(resource.slug)
  const navigate = useNavigate()

  const dirty = code.html !== initial.html || code.css !== initial.css || code.js !== initial.js
  const doc = useCallback(() => buildSrcDoc({ ...code, libs: resource.libs }), [code, resource.libs])

  const idx = resources.findIndex((r) => r.slug === resource.slug)
  const prev = resources[(idx - 1 + resources.length) % resources.length]
  const next = resources[(idx + 1) % resources.length]

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Events forwarded from the preview iframe target the window, which has no closest().
      const t = e.target instanceof HTMLElement ? e.target : null
      if (e.metaKey || e.ctrlKey || e.altKey || t?.closest('.cm-editor, input, textarea, select, [contenteditable="true"], [role="slider"]')) return
      const key = e.key.toLowerCase()
      if (key === 'escape' && immersive) setImmersive(false)
      if (key === 'f') setImmersive(!immersive)
      if (key === 'e') setMinimized((m) => !m)
      if (key === '[') navigate(`/r/${prev.slug}`)
      if (key === ']') navigate(`/r/${next.slug}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [immersive, setImmersive, navigate, prev.slug, next.slug])

  // Briefly announce how to leave immersive mode, then get out of the way.
  useEffect(() => {
    if (!immersive) return setHint(false)
    setHint(true)
    const t = setTimeout(() => setHint(false), 2500)
    return () => clearTimeout(t)
  }, [immersive])

  const reset = () => {
    const before = code
    setCode(initial)
    notify(
      <>
        <span>Edits discarded</span>
        <button onClick={() => setCode(before)} className="font-medium text-lime hover:underline">
          Undo
        </button>
      </>,
      'default',
      5000,
    )
  }

  const fullWidth = viewport === 0
  const openTab = () => window.open(URL.createObjectURL(new Blob([doc()], { type: 'text/html' })), '_blank', 'noopener')

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden bg-paper">
      {/* Full-bleed canvas */}
      <div
        // Device frames centre in the space the floating panel leaves free.
        className={`absolute inset-0 flex transition-[padding] duration-300 ${fullWidth ? '' : 'bg-shell/60 p-4'}`}
        style={fullWidth ? undefined : { paddingRight: Math.max(16, occupied + 8) }}
      >
        <div
          className={`mx-auto h-full max-w-full overflow-hidden bg-white transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
            fullWidth ? '' : 'rounded-xl border border-black/[0.1] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.3)]'
          }`}
          style={{ width: VIEWPORTS[viewport].width }}
        >
          <LivePreview {...code} libs={resource.libs} reloadKey={reloadKey} onError={setError} title={`${resource.title} live preview`} />
        </div>
      </div>

      {/* The floating panel is the only chrome: navigation, preview controls and editor live in it.
          Kept mounted in immersive mode so its position, size and tab survive. */}
      <EditorPanel
        hidden={immersive}
        resource={resource}
        code={code}
        setCode={setCode}
        dirty={dirty}
        minimized={minimized}
        setMinimized={setMinimized}
        onReset={reset}
        onOccupy={setOccupied}
        onDownload={() => downloadSource(resource.slug, code)}
        files={presentFiles(code).map((f) => f.name)}
        viewport={viewport}
        setViewport={setViewport}
        onReload={() => setReloadKey((k) => k + 1)}
        onOpenTab={openTab}
        saved={saved}
        onToggleSave={() => favorites.toggle(resource.slug)}
        onImmersive={() => setImmersive(true)}
        onBack={() => navigate(`/c/${encodeURIComponent(resource.category)}`)}
        prevTitle={prev.title}
        nextTitle={next.title}
        onPrev={() => navigate(`/r/${prev.slug}`)}
        onNext={() => navigate(`/r/${next.slug}`)}
      />

      {/* Immersive exit — barely there until you reach for it */}
      {immersive && (
        <button
          onClick={() => setImmersive(false)}
          className={`absolute right-2 top-2 z-30 flex h-8 items-center gap-2 rounded-md bg-ink/85 px-2.5 text-[12px] text-paper transition-opacity duration-500 hover:opacity-100 focus-visible:opacity-100 ${
            hint ? 'opacity-90' : 'opacity-0'
          }`}
        >
          <Icon name="shrink" className="h-3.5 w-3.5" /> Exit immersive
          <kbd className="rounded-sm bg-white/15 px-1 font-mono text-[10px]">Esc</kbd>
        </button>
      )}

      {error && (
        <div role="alert" className="absolute bottom-3 left-3 z-30 flex max-w-[min(520px,calc(100%-2rem))] items-center gap-2.5 rounded-lg bg-[#b42318] py-2 pl-3 pr-2 text-[12px] text-white shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)]">
          <span className="font-medium">Preview error</span>
          <span className="flex-1 truncate font-mono text-[11px] text-white/85">{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error" className="grid h-6 w-6 place-items-center rounded-sm hover:bg-white/15">
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function ResourceView() {
  const { slug = '' } = useParams()
  const resource = getResource(slug)

  useEffect(() => {
    if (resource) recents.push(resource.slug)
  }, [resource])

  if (!resource) return <NotFound />
  // key resets editor state when switching between resources
  return <Workspace key={resource.slug} resource={resource} />
}
