import { useMemo, useState } from 'react'
import { iconPaths, iconSvg } from '../data/icons'
import { copyText } from '../lib/clipboard'
import { Scroll } from '../components/Scroll'
import { Range, SearchField } from '../components/ui'

const names = Object.keys(iconPaths)

export default function Icons() {
  const [q, setQ] = useState('')
  const [stroke, setStroke] = useState(1.5)
  const list = useMemo(() => names.filter((n) => n.includes(q.toLowerCase().trim())), [q])

  return (
    <>
      <Scroll className="flex-1">
        <div className="px-6 pt-8">
          <h1 className="text-title font-medium tracking-tight">Icons</h1>
          <p className="mt-2 max-w-md text-ui text-muted">{names.length} icons on a 24px grid. Click one to copy its SVG.</p>
        </div>
        <div className="sticky top-0 z-10 mt-5 flex h-12 items-center gap-4 border-y border-line bg-white px-6">
          <SearchField value={q} onChange={setQ} placeholder="Search icons" className="w-56" />
          <Range label="Stroke" value={stroke} min={1} max={3} step={0.25} onChange={setStroke} className="ml-auto w-44 shrink-0 sm:w-56" />
        </div>
        <div className="px-6 pb-12 pt-4">
          {list.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-1.5">
              {list.map((name) => (
                <button
                  key={name}
                  onClick={() => copyText(iconSvg(name, stroke), `${name}.svg`)}
                  aria-label={`Copy ${name} icon`}
                  className="group flex h-20 flex-col items-center justify-center gap-2 rounded-xl border border-line/80 transition-colors hover:border-ink hover:bg-ink hover:text-lime"
                >
                  <span className="h-6 w-6" dangerouslySetInnerHTML={{ __html: iconSvg(name, stroke, '100%') }} />
                  <span className="max-w-full truncate px-1 font-mono text-[10px] text-muted group-hover:text-paper">{name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-ui text-muted">No icons match “{q}”.</p>
          )}
        </div>
      </Scroll>
    </>
  )
}
