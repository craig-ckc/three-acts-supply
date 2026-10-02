// One draggable row: pointer drag with rubber-band edges, momentum that
// settles on the nearest card, and arrow keys. A single rAF loop eases
// the rendered position toward a target, so every input is interruptible.
const slider = document.querySelector('.slider')
const track = slider.querySelector('.slider__track')
const cards = [...track.children]
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

const momentum = parseFloat(slider.dataset.momentum) || 16     // velocity -> throw distance
const resistance = parseFloat(slider.dataset.resistance) || 0.4 // 0 = rigid edge, 1 = free

let x = 0, target = 0, velocity = 0
let dragging = false, startX = 0, startTarget = 0, lastX = 0, lastT = 0
let raf = 0

const minX = () => Math.min(0, slider.clientWidth - parseFloat(getComputedStyle(slider).paddingLeft) * 2 - track.scrollWidth)
const step = () => cards[1].offsetLeft - cards[0].offsetLeft

// Past an edge, movement fades out the further you pull (rubber band).
const rubber = (v, min) => {
  const limit = slider.clientWidth * 0.5
  const band = (d) => (1 - 1 / ((d * resistance) / limit + 1)) * limit
  if (v > 0) return band(v)
  if (v < min) return min - band(min - v)
  return v
}

// Snap to the nearest card, clamped inside the bounds.
const snap = (v) => {
  const min = minX(), s = step()
  return Math.max(min, Math.min(0, Math.round(v / s) * s))
}

const tick = (now) => {
  const prev = x
  x = reduce && !dragging ? target : x + (target - x) * (dragging ? 0.5 : 0.11)
  if (Math.abs(target - x) < 0.05) x = target
  const skew = reduce ? 0 : Math.max(-5, Math.min(5, (x - prev) * -0.12))
  track.style.transform = `translate3d(${x}px,0,0)`
  track.style.setProperty('--skew', `${skew.toFixed(2)}deg`)
  raf = x === target && !dragging ? 0 : requestAnimationFrame(tick)
}
const run = () => { if (!raf) raf = requestAnimationFrame(tick) }

slider.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return
  dragging = true
  slider.classList.add('is-dragging')
  slider.setPointerCapture(e.pointerId)
  startX = lastX = e.clientX
  lastT = e.timeStamp
  startTarget = target = x // grab mid-flight
  velocity = 0
  run()
})

slider.addEventListener('pointermove', (e) => {
  if (!dragging) return
  const dt = Math.max(1, e.timeStamp - lastT)
  velocity = velocity * 0.6 + ((e.clientX - lastX) / dt) * 16 * 0.4 // px per frame, smoothed
  lastX = e.clientX
  lastT = e.timeStamp
  target = rubber(startTarget + (e.clientX - startX), minX())
})

const release = (e) => {
  if (!dragging) return
  dragging = false
  slider.classList.remove('is-dragging')
  if (e.timeStamp - lastT > 80) velocity = 0 // paused before letting go
  target = snap(target + (reduce ? 0 : velocity * momentum))
  run()
}
slider.addEventListener('pointerup', release)
slider.addEventListener('pointercancel', release)

slider.addEventListener('keydown', (e) => {
  const moves = { ArrowRight: -step(), ArrowLeft: step(), Home: Infinity, End: -Infinity }
  if (!(e.key in moves)) return
  e.preventDefault()
  target = snap(target + moves[e.key])
  run()
})

addEventListener('resize', () => { target = snap(target); run() })
