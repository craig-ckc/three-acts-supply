import { useState } from 'react'
import { easings, bezier, type Curve } from '../data/easings'
import { copyText } from '../lib/clipboard'
import { Scroll } from '../components/Scroll'
import { Button, Range } from '../components/ui'
import { Icon } from '../data/icons'

function CurvePlot({ curve }: { curve: Curve }) {
  const [x1, y1, x2, y2] = curve
  const P = (x: number, y: number) => `${10 + x * 100} ${130 - y * 100}`
  return (
    // Extra vertical room in the viewBox keeps overshooting curves (Back) inside the frame.
    <svg viewBox="0 0 120 160" className="h-full w-full">
      <rect x="10" y="30" width="100" height="100" fill="none" stroke="currentColor" strokeOpacity=".12" />
      <line x1="10" y1="130" x2={10 + x1 * 100} y2={130 - y1 * 100} stroke="var(--color-violet)" strokeOpacity=".6" />
      <line x1="110" y1="30" x2={10 + x2 * 100} y2={130 - y2 * 100} stroke="var(--color-violet)" strokeOpacity=".6" />
      <circle cx={10 + x1 * 100} cy={130 - y1 * 100} r="2.5" fill="var(--color-violet)" />
      <circle cx={10 + x2 * 100} cy={130 - y2 * 100} r="2.5" fill="var(--color-violet)" />
      <path d={`M ${P(0, 0)} C ${P(x1, y1)} ${P(x2, y2)} ${P(1, 1)}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function Easings() {
  const [all, setAll] = useState(false)
  const [playing, setPlaying] = useState<Set<string>>(new Set())
  const [duration, setDuration] = useState(1)

  const toggle = (name: string) =>
    setPlaying((p) => {
      const next = new Set(p)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  return (
    <>
      <Scroll className="flex-1">
        <div className="px-6 pt-8">
          <h1 className="text-title font-medium tracking-tight">Easings</h1>
          <p className="mt-2 max-w-md text-ui text-muted">Curves for CSS transitions and GSAP tweens. Play one to feel it, then copy the value you need.</p>
        </div>
        <div className="sticky top-0 z-10 mt-5 flex h-12 items-center gap-4 border-y border-line bg-white px-6">
          <Button variant="ink" size="sm" icon={all ? 'refresh' : 'play'} onClick={() => (setAll((a) => !a), setPlaying(new Set()))}>
            {all ? 'Reset' : 'Play all'}
          </Button>
          <Range label="Duration" value={duration} min={0.3} max={2.5} step={0.1} onChange={setDuration} format={(v) => `${v.toFixed(1)}s`} className="ml-auto w-44 shrink-0 sm:w-56" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 px-6 pb-12 pt-4">
          {easings.map((e) => {
            const on = all || playing.has(e.name)
            return (
              <div key={e.name} className="rounded-xl border border-line p-3">
                <div className="flex items-center gap-2">
                  <h3 className="flex-1 truncate text-ui font-medium">{e.name}</h3>
                  <button
                    onClick={() => toggle(e.name)}
                    aria-label={on ? `Reset ${e.name}` : `Play ${e.name}`}
                    className="grid h-6 w-6 place-items-center rounded-md text-muted hover:bg-paper hover:text-ink"
                  >
                    <Icon name={on ? 'refresh' : 'play'} className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 h-28 rounded-md bg-paper px-6 py-1">
                  <CurvePlot curve={e.curve} />
                </div>
                <div className="mt-2 h-5 rounded-sm bg-paper p-0.5 [container-type:inline-size]">
                  <span
                    className="block h-4 w-4 rounded-[2px] bg-ink"
                    style={{
                      transform: on ? 'translateX(calc(100cqw - 1rem))' : 'translateX(0)',
                      transition: `transform ${duration}s ${bezier(e.curve)}`,
                    }}
                  />
                </div>
                <p className="mt-2 truncate font-mono text-[10px] text-muted" title={bezier(e.curve)}>
                  {e.curve.join(', ')}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <Button variant="ghost" size="xs" onClick={() => copyText(bezier(e.curve), 'CSS easing')}>
                    Copy CSS
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => copyText(`ease: "${e.gsap}"`, 'GSAP ease')}>
                    Copy GSAP
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Scroll>
    </>
  )
}
