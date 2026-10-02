import { useParams, useSearchParams } from 'react-router-dom'
import { getResource } from '../data/resources'
import { LivePreview } from '../components/LivePreview'

/**
 * Bare, full-screen preview of a single resource — no app chrome.
 * `?w=390` constrains the frame to a device width for breakpoint checks.
 */
export default function PreviewPage() {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const resource = getResource(slug)
  const width = params.get('w')

  if (!resource) return <p className="p-6 font-mono text-sm">Unknown resource “{slug}”.</p>

  return (
    <div className="flex h-dvh justify-center bg-shell">
      <div className="h-full bg-white" style={{ width: width ? `${width}px` : '100%' }}>
        <LivePreview {...resource} title={`${resource.title} preview`} />
      </div>
    </div>
  )
}
