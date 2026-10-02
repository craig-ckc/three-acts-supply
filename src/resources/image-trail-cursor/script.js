const stage = document.querySelector('.trail')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

// Generated artwork: simple shapes on a 100x100 grid, painted in brand pairs.
const SHAPES = [
  '<circle cx="50" cy="50" r="30"/>',
  '<path d="M18 64a32 32 0 0 1 64 0z"/>',
  '<path d="M26 74V26a48 48 0 0 1 48 48z"/>',
  '<path d="M50 20 82 76H18z"/>',
  '<circle cx="50" cy="50" r="25" fill="none" stroke-width="13"/>',
  '<path d="M42 20h16v22h22v16H58v22H42V58H20V42h22z"/>',
  '<path d="M22 22h56v14H22zm0 21h56v14H22zm0 21h56v14H22z"/>',
  '<path d="M50 18 82 50 50 82 18 50z"/>',
]
const PAIRS = [['ink', 'lime'], ['lime', 'ink'], ['violet', 'paper'], ['paper', 'violet'], ['paper', 'ink']]
// Random pick that never repeats the previous one, so neighbours always differ.
const picker = (list) => {
  let prev = -1
  return () => {
    let i = Math.floor(Math.random() * (list.length - 1))
    if (i >= prev) i++
    return list[(prev = i)]
  }
}
const nextShape = picker(SHAPES)
const nextPair = picker(PAIRS)

// A small pool of tiles, recycled oldest-first.
const POOL = 32
const tiles = Array.from({ length: POOL }, () => {
  const el = document.createElement('div')
  el.className = 'trail__tile'
  el.setAttribute('aria-hidden', 'true')
  stage.append(el)
  return { el, tl: null }
})
let count = 0

const seconds = (name, fallback) => {
  const v = getComputedStyle(stage).getPropertyValue(name).trim()
  const n = parseFloat(v)
  return Number.isNaN(n) ? fallback : v.endsWith('ms') ? n / 1000 : n
}

// The one technique: drop a tile at (x, y) and let it pop, drift and leave.
function spawn(x, y, vx, vy, age = 0) {
  const tile = tiles[count++ % POOL]
  const { el } = tile
  tile.tl?.kill()

  const [bg, fg] = nextPair()
  el.style.setProperty('--bg', `var(--${bg})`)
  el.style.setProperty('--fg', `var(--${fg})`)
  el.innerHTML = `<svg viewBox="0 0 100 100">${nextShape()}</svg>`
  el.classList.remove('is-new')
  if (!age) { void el.offsetWidth; el.classList.add('is-new') }

  const life = seconds('--life', 1)
  const rotation = gsap.utils.random(-16, 16)
  gsap.set(el, { x, y, xPercent: -50, yPercent: -50, zIndex: count, rotation, scale: 1, opacity: 0 })

  const tl = gsap.timeline()
  if (reduce) {
    tl.to(el, { opacity: 1, duration: 0.15 })
      .to(el, { opacity: 0, duration: 0.4 }, life + 0.3)
  } else {
    tl.fromTo(el, { scale: 0.3, rotation: rotation - vx * 0.6 },
                  { scale: 1, rotation, opacity: 1, duration: 0.6, ease: 'expo.out' })
      .to(el, { x: x + vx, y: y + vy, duration: life + 0.9, ease: 'expo.out' }, 0)
      .to(el, { scale: 0, rotation: rotation + vx * 0.4, duration: 0.5, ease: 'power3.in' }, life + 0.35)
      .to(el, { opacity: 0, duration: 0.2 }, life + 0.65)
  }
  if (age) tl.time(age)
  tile.tl = tl
}

// Spawn evenly along the path: one tile every `spacing` pixels travelled.
let last = null
function trailTo(x, y, age = 0) {
  if (!last) { last = { x, y }; return }
  const spacing = parseFloat(stage.dataset.spacing) || 72
  let dx = x - last.x, dy = y - last.y
  let dist = Math.hypot(dx, dy)
  while (dist >= spacing) {
    const ux = dx / dist, uy = dy / dist
    last = { x: last.x + ux * spacing, y: last.y + uy * spacing }
    spawn(last.x, last.y, ux * 26, uy * 26, age)
    dx = x - last.x; dy = y - last.y; dist = Math.hypot(dx, dy)
  }
}

// Idle: loop a soft ellipse around the centre so the canvas is never empty.
const SPEED = 1.6
let phase = 0, lastInput = -Infinity, mode = 'idle'
const idlePoint = (t) => {
  const r = stage.getBoundingClientRect()
  const R = Math.min(r.width * 0.3, r.height * 0.3, 220)
  return {
    x: r.width / 2 + Math.cos(t) * R * 1.25,
    y: r.height / 2 + Math.sin(t) * R * 0.8 + Math.sin(t * 3) * R * 0.12,
  }
}
// Pre-run the last couple of seconds so the very first paint already shows a trail.
for (let t = -2.2; t <= 0; t += 0.02) {
  const p = idlePoint(phase + t * SPEED)
  trailTo(p.x, p.y, -t)
}
if (reduce) gsap.globalTimeline.pause()

gsap.ticker.add((time, dt) => {
  if (reduce || time - lastInput < 2) return
  if (mode === 'user') { mode = 'idle'; last = null } // hand back to the idle loop cleanly
  phase += (dt / 1000) * SPEED
  const p = idlePoint(phase)
  trailTo(p.x, p.y)
})

function input(x, y) {
  if (reduce) gsap.globalTimeline.resume()
  if (mode === 'idle') { mode = 'user'; last = null }
  lastInput = gsap.ticker.time
  trailTo(x, y)
}

stage.addEventListener('pointermove', (e) => {
  const r = stage.getBoundingClientRect()
  for (const ev of e.getCoalescedEvents?.() || [e]) input(ev.clientX - r.left, ev.clientY - r.top)
})
stage.addEventListener('pointerdown', (e) => {
  const r = stage.getBoundingClientRect()
  last = null
  input(e.clientX - r.left, e.clientY - r.top)
})

// Keyboard: arrow keys walk the trail head around the canvas.
const STEP = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
let head = null
stage.addEventListener('keydown', (e) => {
  const dir = STEP[e.key]
  if (!dir) return
  e.preventDefault()
  const r = stage.getBoundingClientRect()
  head ??= last ? { ...last } : { x: r.width / 2, y: r.height / 2 }
  if (mode === 'idle') input(head.x, head.y)
  const step = (parseFloat(stage.dataset.spacing) || 72) * 1.5
  head.x = gsap.utils.clamp(40, r.width - 40, head.x + dir[0] * step)
  head.y = gsap.utils.clamp(40, r.height - 40, head.y + dir[1] * step)
  input(head.x, head.y)
})
stage.addEventListener('blur', () => { head = null })
