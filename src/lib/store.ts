import { useSyncExternalStore } from 'react'

/** Tiny localStorage-backed store for per-user vault state (favourites, recents). */
function createListStore(key: string, limit = Infinity) {
  let state: string[] = []
  try {
    state = JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    /* storage unavailable — start empty */
  }
  const listeners = new Set<() => void>()
  const set = (next: string[]) => {
    state = next.slice(0, limit)
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l())
  }
  const subscribe = (l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  }
  return {
    get: () => state,
    use: () => useSyncExternalStore(subscribe, () => state),
    toggle: (id: string) => set(state.includes(id) ? state.filter((x) => x !== id) : [id, ...state]),
    push: (id: string) => set([id, ...state.filter((x) => x !== id)]),
    clear: () => set([]),
  }
}

export const favorites = createListStore('tas:favorites')
export const recents = createListStore('tas:recents', 12)
