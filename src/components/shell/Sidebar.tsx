import { NavLink } from 'react-router-dom'
import { categories, categoryIcons, resources } from '../../data/resources'
import { favorites, recents } from '../../lib/store'
import { Icon } from '../../data/icons'
import { Mark } from '../Logo'
import { Scroll } from '../Scroll'
import { Tooltip } from '../ui'
import { useShell } from './AppShell'

const counts = resources.reduce<Record<string, number>>((m, r) => ((m[r.category] = (m[r.category] ?? 0) + 1), m), {})
const newCount = resources.filter((r) => r.addedDaysAgo <= 7).length
const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

interface ItemProps {
  to: string
  icon: string
  label: string
  count?: number
  end?: boolean
  rail: boolean
}

function Item({ to, icon, label, count, end, rail }: ItemProps) {
  const showCount = count !== undefined && count > 0
  const link = (
    <NavLink
      to={to}
      end={end}
      aria-label={rail ? label : undefined}
      className={({ isActive }) =>
        `group flex h-8 w-full items-center gap-2.5 rounded-md text-ui transition-colors ${rail ? 'justify-center' : 'px-2.5'} ${
          isActive ? 'bg-white font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.05]' : 'text-ink-2 hover:bg-black/[0.05] hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} className={`h-[15px] w-[15px] ${isActive ? '' : 'opacity-65 group-hover:opacity-100'}`} />
          {!rail && <span className="flex-1 truncate">{label}</span>}
          {!rail && showCount && <span className="font-mono text-[10.5px] tabular-nums text-muted-shell">{count}</span>}
        </>
      )}
    </NavLink>
  )
  return rail ? (
    <Tooltip label={label} detail={showCount ? String(count) : undefined} side="right" className="flex">
      {link}
    </Tooltip>
  ) : (
    link
  )
}

function Section({ title, rail, children }: { title: string; rail: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      {rail ? <div className="mx-2.5 mb-2 h-px bg-black/[0.08]" /> : <p className="mb-1 px-2.5 text-[11px] font-medium text-muted-shell">{title}</p>}
      <div className="space-y-px">{children}</div>
    </div>
  )
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const favs = favorites.use()
  const recent = recents.use()
  const { toggleSidebar, openSearch } = useShell()
  const rail = collapsed
  const mod = isMac ? '⌘' : 'Ctrl'

  return (
    <div className={`flex h-full flex-col ${rail ? 'w-[60px]' : 'w-[248px]'}`}>
      <div className={`flex h-12 shrink-0 items-center gap-2 ${rail ? 'justify-center' : 'pl-3.5 pr-2'}`}>
        {rail ? (
          <Tooltip label="Expand sidebar" shortcut={`${mod} B`} side="right">
            <button onClick={toggleSidebar} className="group/logo relative grid h-7 w-7 place-items-center rounded-md bg-ink text-lime" aria-label="Expand sidebar">
              <Mark className="h-4 w-4 transition-opacity group-hover/logo:opacity-0" />
              <Icon name="chevron-right" className="absolute h-4 w-4 opacity-0 transition-opacity group-hover/logo:opacity-100" />
            </button>
          </Tooltip>
        ) : (
          <>
            <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-lime">
              <Mark className="h-4 w-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Three Acts</span>
            <Tooltip label="Collapse sidebar" shortcut={`${mod} B`} className="ml-auto inline-flex">
              <button onClick={toggleSidebar} className="grid h-7 w-7 place-items-center rounded-md text-muted-shell hover:bg-black/[0.05] hover:text-ink" aria-label="Collapse sidebar">
                <Icon name="sidebar" />
              </button>
            </Tooltip>
          </>
        )}
      </div>

      <div className="px-2 pb-1">
        {rail ? (
          <Tooltip label="Search" shortcut={`${mod} K`} side="right" className="flex">
            <button onClick={openSearch} aria-label="Search" className="grid h-8 w-full place-items-center rounded-md text-ink-2 hover:bg-black/[0.05] hover:text-ink">
              <Icon name="search" className="h-[15px] w-[15px] opacity-65" />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={openSearch}
            className="flex h-8 w-full items-center gap-2 rounded-md border border-black/[0.1] pl-2.5 pr-1.5 text-ui text-muted-shell transition-colors hover:border-black/20 hover:text-ink"
          >
            <Icon name="search" className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="rounded-sm border border-black/[0.1] px-1 font-mono text-[10px]">{mod} K</kbd>
          </button>
        )}
      </div>

      <Scroll className="flex-1">
        <nav className="px-2 pb-4 pt-2">
          <div className="space-y-px">
            <Item rail={rail} to="/" end icon="grid" label="The Vault" count={resources.length} />
            <Item rail={rail} to="/new" icon="sparkles" label="New this week" count={newCount} />
            <Item rail={rail} to="/favorites" icon="bookmark" label="Bookmarks" count={favs.length} />
            <Item rail={rail} to="/recent" icon="clock" label="Recently viewed" count={recent.length} />
          </div>

          <Section title="Categories" rail={rail}>
            {categories.map((c) => (
              <Item rail={rail} key={c} to={`/c/${encodeURIComponent(c)}`} icon={categoryIcons[c]} label={c} count={counts[c] ?? 0} />
            ))}
          </Section>

          <Section title="Library" rail={rail}>
            <Item rail={rail} to="/icons" icon="shapes" label="Icons" />
            <Item rail={rail} to="/easings" icon="curve" label="Easings" />
          </Section>
        </nav>
      </Scroll>

      <div className="border-t border-black/[0.07] p-2">
        <div className={`flex h-10 items-center gap-2.5 ${rail ? 'justify-center' : 'px-1.5'}`}>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-ink text-[12px] font-semibold text-lime" aria-hidden>
            N
          </span>
          {!rail && <span className="truncate text-ui font-medium">Nico</span>}
        </div>
      </div>
    </div>
  )
}
