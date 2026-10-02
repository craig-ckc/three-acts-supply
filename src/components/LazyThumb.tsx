import { useEffect, useRef, useState } from 'react'
import type { Resource } from '../data/resources'
import { LivePreview } from './LivePreview'

/** Renders a live, non-interactive preview only once the card scrolls into view. */
export function LazyThumb({ resource, interactive = false }: { resource: Resource; interactive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-paper-2">
      {visible && (
        <div className="absolute left-0 top-0 h-[200%] w-[200%] origin-top-left scale-50">
          <LivePreview {...resource} debounce={0} interactive={interactive} title={`${resource.title} preview`} />
        </div>
      )}
    </div>
  )
}
