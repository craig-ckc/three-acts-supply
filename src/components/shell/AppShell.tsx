import { createContext, useContext, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ToasterContainer, PLACEMENT } from 'baseui/toast'
import { Sidebar } from './Sidebar'
import { CommandPalette } from './CommandPalette'

interface ShellCtx {
  openSearch: () => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  immersive: boolean
  setImmersive: (v: boolean) => void
}
const Ctx = createContext<ShellCtx>({
  openSearch: () => {},
  sidebarCollapsed: false,
  toggleSidebar: () => {},
  immersive: false,
  setImmersive: () => {},
})
export const useShell = () => useContext(Ctx)

const readCollapsed = () => {
  try {
    return localStorage.getItem('tas:sidebar') === 'collapsed'
  } catch {
    return false
  }
}

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [immersive, setImmersive] = useState(false)
  const { pathname } = useLocation()

  // Immersive mode belongs to a single resource view.
  useEffect(() => setImmersive(false), [pathname])

  const toggleSidebar = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem('tas:sidebar', c ? 'expanded' : 'collapsed')
      } catch {
        /* ignore */
      }
      return !c
    })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      const k = e.key.toLowerCase()
      if (k === 'k') (e.preventDefault(), setSearchOpen((o) => !o))
      if (k === 'b') (e.preventDefault(), toggleSidebar())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Ctx.Provider
      value={{ openSearch: () => setSearchOpen(true), sidebarCollapsed: collapsed, toggleSidebar, immersive, setImmersive }}
    >
      <div className="flex h-dvh overflow-hidden bg-shell">
        <aside
          className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
            immersive ? 'w-0' : collapsed ? 'w-[60px]' : 'w-[248px]'
          }`}
        >
          <Sidebar collapsed={collapsed} />
        </aside>
        <main className={`flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ${immersive ? 'p-0' : 'py-2 pr-2'}`}>
          <div
            // Border and clip live on the same element, so the radius never cuts the edge.
            className={`relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white transition-[border-radius] duration-300 ${
              immersive ? 'rounded-none' : 'rounded-2xl border border-black/[0.12] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_16px_-8px_rgba(0,0,0,0.12)]'
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ToasterContainer placement={PLACEMENT.bottom} autoHideDuration={1800} overrides={{ Root: { style: { zIndex: 120, bottom: '16px' } } }} />
    </Ctx.Provider>
  )
}
