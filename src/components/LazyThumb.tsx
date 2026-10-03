import { useEffect, useRef, useState } from 'react'
import type { Resource } from '../data/resources'

function PreviewVideo({ preview, onError }: { preview: NonNullable<Resource['preview']>; onError: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = ref.current
    // Restore the source after React Strict Mode's development cleanup too.
    video?.setAttribute('src', preview.video)
    return () => {
      // Removing a media element alone can leave playback/fetching alive until GC.
      video?.pause()
      video?.removeAttribute('src')
      video?.load()
    }
  }, [preview.video])

  return (
    <video
      ref={ref}
      src={preview.video}
      poster={preview.poster}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onError={onError}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    />
  )
}
/** Only visible cards mount a video decoder. Leaving the viewport releases it. */
export function LazyThumb({ resource }: { resource: Resource }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [motionAllowed, setMotionAllowed] = useState(false)
  const [failedVideo, setFailedVideo] = useState<string | null>(null)
  const preview = resource.preview

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setMotionAllowed(!motion.matches && document.visibilityState === 'visible')
    update()
    motion.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      motion.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden bg-paper">
      {preview ? (
        <>
          <img src={preview.poster} alt="" loading="lazy" decoding="async" width={640} height={440} className="absolute inset-0 h-full w-full object-cover" />
          {visible && motionAllowed && failedVideo !== preview.video && (
            <PreviewVideo
              key={preview.video}
              preview={preview}
              onError={() => setFailedVideo(preview.video)}
            />
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-ui text-muted">{resource.title}</div>
      )}
    </div>
  )
}
