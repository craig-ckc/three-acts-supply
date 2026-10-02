import { Link, useNavigate } from 'react-router-dom'
import { StatefulPopover, PLACEMENT } from 'baseui/popover'
import type { Resource } from '../data/resources'
import { favorites } from '../lib/store'
import { buildSrcDoc } from '../lib/buildSrcDoc'
import { copyText } from '../lib/clipboard'
import { Icon } from '../data/icons'
import { LazyThumb } from './LazyThumb'

/** One status badge at most, by priority — a corner full of pills says nothing. */
function badgeFor(r: Resource) {
  if (r.addedDaysAgo <= 7) return { label: 'New', className: 'bg-lime text-ink' }
  if (r.free) return { label: 'Free', className: 'bg-white text-ink shadow-[0_1px_2px_rgba(0,0,0,0.12)]' }
  return null
}

function MenuItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button role="menuitem" onClick={onClick} className="flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-left text-ui text-ink-2 hover:bg-paper hover:text-ink">
      <Icon name={icon} className="h-3.5 w-3.5 text-muted" />
      {label}
    </button>
  )
}

export function ResourceTile({ resource, showCategory = true }: { resource: Resource; showCategory?: boolean }) {
  const favs = favorites.use()
  const saved = favs.includes(resource.slug)
  const navigate = useNavigate()
  const badge = badgeFor(resource)
  const meta = showCategory ? resource.category : resource.tags.join(' · ')

  return (
    <div className="group relative">
      <Link
        to={`/r/${resource.slug}`}
        tabIndex={-1}
        aria-hidden
        className="block overflow-hidden rounded-xl border border-black/[0.08] bg-paper transition duration-300 group-hover:border-black/[0.16] group-hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.3)]"
      >
        <div className="relative aspect-[16/11]">
          <LazyThumb resource={resource} />
        </div>
      </Link>

      {badge && (
        <span className={`pointer-events-none absolute left-2 top-2 rounded-sm px-1.5 py-0.5 text-[10.5px] font-medium ${badge.className}`}>{badge.label}</span>
      )}

      <button
        onClick={() => favorites.toggle(resource.slug)}
        aria-label={saved ? `Remove ${resource.title} from bookmarks` : `Bookmark ${resource.title}`}
        aria-pressed={saved}
        className={`absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md transition ${
          saved ? 'bg-violet text-white' : 'bg-white text-ink opacity-0 shadow-[0_1px_2px_rgba(0,0,0,0.12)] group-hover:opacity-100 focus-visible:opacity-100'
        }`}
      >
        <Icon name="bookmark" className={`h-3.5 w-3.5 ${saved ? '[&_path]:fill-current' : ''}`} />
      </button>

      <div className="flex items-start gap-2 pt-2.5">
        <div className="min-w-0 flex-1">
          <Link to={`/r/${resource.slug}`} className="block truncate text-ui font-medium hover:underline hover:underline-offset-2">
            {resource.title}
          </Link>
          <p className="truncate text-xs text-muted">{meta}</p>
        </div>
        <StatefulPopover
          placement={PLACEMENT.bottomRight}
          overrides={{
            Body: {
              style: {
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 12px 32px -12px rgba(0,0,0,0.3)',
                backgroundColor: '#fff',
                overflow: 'hidden',
              },
            },
            Inner: { style: { backgroundColor: '#fff' } },
          }}
          content={({ close }) => (
            <div role="menu" className="w-52 p-1">
              <MenuItem icon="arrow-right" label="Open" onClick={() => (close(), navigate(`/r/${resource.slug}`))} />
              <MenuItem icon="bookmark" label={saved ? 'Remove bookmark' : 'Bookmark'} onClick={() => (close(), favorites.toggle(resource.slug))} />
              <div className="mx-2 my-1 h-px bg-line" />
              <MenuItem icon="copy" label="Copy HTML document" onClick={() => (close(), copyText(buildSrcDoc(resource), 'HTML document'))} />
              <MenuItem
                icon="external"
                label="Open preview in new tab"
                onClick={() => {
                  close()
                  window.open(URL.createObjectURL(new Blob([buildSrcDoc(resource)], { type: 'text/html' })), '_blank', 'noopener')
                }}
              />
            </div>
          )}
        >
          <button className="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted hover:bg-paper hover:text-ink" aria-label={`More actions for ${resource.title}`} aria-haspopup="menu">
            <Icon name="dots" />
          </button>
        </StatefulPopover>
      </div>
    </div>
  )
}
