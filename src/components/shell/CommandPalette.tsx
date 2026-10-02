import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, ROLE, SIZE } from 'baseui/modal'
import { categories, categoryIcons, resources } from '../../data/resources'
import { Icon } from '../../data/icons'
import { Scroll } from '../Scroll'

interface Item {
  id: string
  label: string
  hint: string
  icon: string
  to: string
  kind: 'page' | 'resource'
  haystack: string
}

const pages: Item[] = [
  { id: 'p-vault', label: 'The Vault', hint: 'Page', icon: 'grid', to: '/' },
  { id: 'p-new', label: 'New this week', hint: 'Page', icon: 'sparkles', to: '/new' },
  { id: 'p-fav', label: 'Bookmarks', hint: 'Page', icon: 'bookmark', to: '/favorites' },
  { id: 'p-icons', label: 'Icons', hint: 'Library', icon: 'shapes', to: '/icons' },
  { id: 'p-easings', label: 'Easings', hint: 'Library', icon: 'curve', to: '/easings' },
  ...categories.map((c) => ({ id: `c-${c}`, label: c, hint: 'Category', icon: categoryIcons[c], to: `/c/${encodeURIComponent(c)}` })),
].map((p) => ({ ...p, kind: 'page' as const, haystack: p.label.toLowerCase() }))

const items: Item[] = resources.map((r) => ({
  id: r.slug,
  label: r.title,
  hint: r.category,
  icon: categoryIcons[r.category],
  to: `/r/${r.slug}`,
  kind: 'resource' as const,
  haystack: `${r.title} ${r.category} ${r.tags.join(' ')}`.toLowerCase(),
}))

/** Prefix match on the label beats a word-start match, beats anywhere in the label, beats tags/category. */
function score(item: Item, q: string) {
  const label = item.label.toLowerCase()
  if (label.startsWith(q)) return 0
  if (label.split(/[\s(]+/).some((w) => w.startsWith(q))) return 1
  if (label.includes(q)) return 2
  if (item.haystack.includes(q)) return 3
  return -1
}

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return [...pages.slice(0, 5), ...items.slice(0, 8)]
    return [...pages, ...items]
      .map((item) => ({ item, s: score(item, n) }))
      .filter((x) => x.s >= 0)
      // Exact page/category hits first, then by score, resources after pages at equal score.
      .sort((a, b) => a.s - b.s || (a.item.kind === b.item.kind ? 0 : a.item.kind === 'page' ? -1 : 1))
      .slice(0, 30)
      .map((x) => x.item)
  }, [q])

  useEffect(() => setActive(0), [q])
  useEffect(() => {
    if (!isOpen) setQ('')
  }, [isOpen])
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (item?: Item) => {
    if (!item) return
    navigate(item.to)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      role={ROLE.dialog}
      size={SIZE.auto}
      // closeable enables Esc and click-outside; the default × button is hidden.
      closeable
      overrides={{
        Root: { style: { zIndex: 60 } },
        Close: { style: { display: 'none' } },
        Dialog: {
          style: {
            width: 'min(560px, calc(100vw - 32px))',
            borderRadius: '10px',
            margin: '14vh auto auto',
            overflow: 'hidden',
            boxShadow: '0 24px 64px -16px rgba(0,0,0,0.35)',
            border: '1px solid rgba(0,0,0,0.08)',
          },
        },
        DialogContainer: { style: { alignItems: 'flex-start', backgroundColor: 'rgba(20,20,20,0.28)' } },
      }}
    >
      <div className="flex h-12 items-center gap-2.5 border-b border-line px-3.5">
        <Icon name="search" className="h-4 w-4 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') (e.preventDefault(), setActive((a) => Math.min(a + 1, results.length - 1)))
            if (e.key === 'ArrowUp') (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)))
            if (e.key === 'Enter') go(results[active])
            if (e.key === 'Escape') (e.preventDefault(), onClose())
          }}
          placeholder="Search resources, categories and pages"
          aria-label="Search"
          className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted"
        />
        <button onClick={onClose} className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted hover:border-ink/30 hover:text-ink" aria-label="Close search">
          Esc
        </button>
      </div>
      <Scroll className="max-h-[min(420px,50vh)]" viewportClassName="max-h-[min(420px,50vh)]" viewportRef={listRef}>
        <div className="p-1.5" role="listbox" aria-label="Results">
          {results.length === 0 && <p className="py-10 text-center text-ui text-muted">Nothing matches “{q}”.</p>}
          {results.map((item, i) => (
            <button
              key={item.id}
              data-index={i}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => go(item)}
              className={`flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left text-ui ${i === active ? 'bg-paper text-ink' : 'text-ink-2'}`}
            >
              <Icon name={item.icon} className="h-4 w-4 text-muted" />
              <span className="flex-1 truncate">{item.label}</span>
              <span className="text-xs text-muted">{item.hint}</span>
            </button>
          ))}
        </div>
      </Scroll>
    </Modal>
  )
}
