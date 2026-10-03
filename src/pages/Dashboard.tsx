import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { categories, resources, type Category } from '../data/resources'
import { favorites, recents } from '../lib/store'
import { ResourceTile } from '../components/ResourceTile'
import { Scroll } from '../components/Scroll'
import { Button, SearchField, Segmented, Switch } from '../components/ui'
import NotFound from './NotFound'

export type View = 'all' | 'new' | 'favorites' | 'recent' | 'category'
type Sort = 'new' | 'az'
type Density = 'comfortable' | 'compact'

const titles: Record<Exclude<View, 'category'>, string> = {
  all: 'Welcome to the Vault',
  new: 'New this week',
  favorites: 'Bookmarks',
  recent: 'Recently viewed',
}

const emptyCopy: Record<Exclude<View, 'all' | 'category'>, { title: string; body: string }> = {
  new: { title: 'Nothing new this week', body: 'Fresh resources land here for seven days after release.' },
  favorites: { title: 'No bookmarks yet', body: 'Hover any tile and press the bookmark icon to keep it here.' },
  recent: { title: 'Nothing viewed yet', body: 'Resources you open will show up here.' },
}

export default function Dashboard({ view }: { view: View }) {
  const { category } = useParams()
  const navigate = useNavigate()
  const favs = favorites.use()
  const recent = recents.use()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('new')
  const [freeOnly, setFreeOnly] = useState(false)
  const [density, setDensity] = useState<Density>('comfortable')

  const cat = view === 'category' ? (decodeURIComponent(category ?? '') as Category) : null
  const personal = view === 'favorites' || view === 'recent'

  const base = useMemo(() => {
    const bySlug = (s: string) => resources.find((r) => r.slug === s)
    if (view === 'new') return resources.filter((r) => r.addedDaysAgo <= 7)
    if (view === 'favorites') return favs.map(bySlug).filter((r) => r !== undefined)
    if (view === 'recent') return recent.map(bySlug).filter((r) => r !== undefined)
    if (cat) return resources.filter((r) => r.category === cat)
    return resources
  }, [view, cat, favs, recent])

  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    const filtered = base.filter(
      (r) => (!freeOnly || r.free) && (!n || [r.title, r.category, r.description, ...r.tags].join(' ').toLowerCase().includes(n)),
    )
    // Personal lists keep their own order (most recent first).
    if (personal) return filtered
    return [...filtered].sort((a, b) => (sort === 'az' ? a.title.localeCompare(b.title) : a.addedDaysAgo - b.addedDaysAgo))
  }, [base, q, freeOnly, sort, personal])

  if (cat && !categories.includes(cat)) return <NotFound />

  const title = cat ?? titles[view as Exclude<View, 'category'>]
  const filtering = q.trim() !== '' || freeOnly
  const clear = () => (setQ(''), setFreeOnly(false))

  return (
    <Scroll className="flex-1">
      <header className={view === 'all' ? 'px-6 pb-6 pt-12 text-center' : 'px-6 pb-5 pt-8'}>
        <h1 className={view === 'all' ? 'text-[40px] font-medium leading-none tracking-[-0.035em]' : 'text-title font-medium tracking-tight'}>{title}</h1>
        {base.length > 0 && (
          <p className="mt-2 text-ui text-muted">
            {base.length} resource{base.length === 1 ? '' : 's'}
            {view === 'all' && ', each with a live, editable preview'}
          </p>
        )}
        {view === 'all' && <SearchField size="lg" value={q} onChange={setQ} placeholder="Filter by name, category or tag" className="mx-auto mt-5 max-w-md" />}
      </header>

      {base.length > 0 && (
        <div className="sticky top-0 z-10 flex h-12 items-center gap-2 border-y border-line bg-white px-6">
          {view !== 'all' && <SearchField value={q} onChange={setQ} placeholder="Filter" className="w-56" />}
          {filtering && (
            <span className="text-xs text-muted">
              {list.length} of {base.length}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Switch checked={freeOnly} onChange={setFreeOnly} label="Free only" />
            {!personal && (
              <Segmented<Sort>
                label="Sort"
                value={sort}
                onChange={setSort}
                options={[
                  { value: 'new', label: 'Newest' },
                  { value: 'az', label: 'A–Z' },
                ]}
              />
            )}
            <Segmented<Density>
              label="Grid density"
              value={density}
              onChange={setDensity}
              options={[
                { value: 'comfortable', icon: 'card', title: 'Large tiles' },
                { value: 'compact', icon: 'grid', title: 'Small tiles' },
              ]}
            />
          </div>
        </div>
      )}

      <div className="px-6 pb-12 pt-5">
        {list.length > 0 ? (
          <div
            className={`grid gap-x-5 gap-y-6 ${
              density === 'compact' ? 'grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))]' : 'grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))]'
            }`}
          >
            {list.map((r) => (
              <ResourceTile key={r.slug} resource={r} showCategory={view !== 'category'} hideFree={freeOnly} />
            ))}
          </div>
        ) : base.length > 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-line text-center">
            <p className="text-ui text-ink-2">{q.trim() ? `No resources match “${q.trim()}”` : 'No free resources here'}</p>
            <Button size="sm" onClick={clear}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-xl border border-line text-center">
            {view !== 'all' && view !== 'category' && (
              <>
                <p className="text-ui font-medium">{emptyCopy[view].title}</p>
                <p className="max-w-sm text-balance text-ui text-muted">{emptyCopy[view].body}</p>
              </>
            )}
            <Button size="sm" variant="ink" className="mt-3" onClick={() => navigate('/')}>
              Browse the Vault
            </Button>
          </div>
        )}
      </div>
    </Scroll>
  )
}
