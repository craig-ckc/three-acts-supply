import { useEffect, useRef, useState } from 'react'
import { buildSrcDoc, type SrcDocInput } from '../lib/buildSrcDoc'

interface Props extends SrcDocInput {
  className?: string
  /** Delay before reloading after HTML/JS changes (ms). CSS changes are hot-swapped. */
  debounce?: number
  /** Bump to force a full reload. */
  reloadKey?: number
  interactive?: boolean
  onError?: (message: string | null) => void
  title: string
}

export function LivePreview({ html, css, js, libs, className, debounce = 350, reloadKey = 0, interactive = true, onError, title }: Props) {
  const ref = useRef<HTMLIFrameElement>(null)
  const cssRef = useRef(css)
  cssRef.current = css

  // The document only rebuilds when markup, script or libraries change.
  const thumbnail = !interactive
  const [doc, setDoc] = useState(() => buildSrcDoc({ html, css, js, libs, thumbnail }))
  const libsKey = libs?.join(',')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const t = setTimeout(() => {
      onError?.(null)
      setDoc(buildSrcDoc({ html, css: cssRef.current, js, libs, thumbnail }))
    }, debounce)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, js, libsKey, debounce])

  // CSS is pushed straight into the running document — no reload, no lost state.
  useEffect(() => {
    ref.current?.contentWindow?.postMessage({ type: 'set-css', css }, '*')
  }, [css])

  // Re-dispatch shortcuts pressed inside the iframe on the host window.
  useEffect(() => {
    if (!interactive) return
    const handler = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow || e.data?.type !== 'preview-key') return
      const { key, metaKey, ctrlKey, shiftKey } = e.data
      window.dispatchEvent(new KeyboardEvent('keydown', { key, metaKey, ctrlKey, shiftKey }))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [interactive])

  useEffect(() => {
    if (!onError) return
    const handler = (e: MessageEvent) => {
      if (e.source === ref.current?.contentWindow && e.data?.type === 'preview-error') onError(e.data.message)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [onError])

  return (
    <iframe
      key={reloadKey}
      ref={ref}
      title={title}
      srcDoc={doc}
      sandbox="allow-scripts"
      className={className}
      // Re-sync CSS on (re)load in case it changed while the document was rebuilding.
      onLoad={() => ref.current?.contentWindow?.postMessage({ type: 'set-css', css: cssRef.current }, '*')}
      style={{ border: 0, width: '100%', height: '100%', display: 'block', pointerEvents: interactive ? 'auto' : 'none', background: 'white' }}
    />
  )
}
