// Odometer: each digit is a drum of 0-9 repeated. Rolling always moves forward,
// and drums further right spin extra turns, like a real mechanical counter.
const odo = document.querySelector('.odometer')
const digitsEl = odo.querySelector('.odometer__digits')
const live = odo.querySelector('.odometer__live')
const LOOPS = 4 // copies of 0-9 in each drum
const PITCH = 1.2 // em height of one digit, matches .odometer__col

const place = (strip, pos) => (strip.style.transform = 'translateY(' + -pos * PITCH + 'em)')

let value = String(odo.dataset.value)
const cols = [...value].map((d) => {
  const col = document.createElement('span')
  col.className = 'odometer__col'
  col.innerHTML =
    '<span class="odometer__peek"><span class="odometer__strip">' +
    Array.from({ length: LOOPS * 10 }, (_, i) => '<span>' + (i % 10) + '</span>').join('') +
    '</span></span>'
  digitsEl.append(col)
  const strip = col.querySelector('.odometer__strip')
  place(strip, +d)
  return { col, strip }
})
live.textContent = value

function rollTo(next) {
  const n = cols.length
  const base = +odo.dataset.duration || 1400
  const stagger = +odo.dataset.stagger || 0

  cols.forEach((c, i) => {
    const target = +next[i]
    // Where the drum is right now, so a click mid-roll carries on from there
    const now = -new DOMMatrix(getComputedStyle(c.strip).transform).m42 / c.col.offsetHeight
    const from = now % 10

    let to = target + 10 * Math.min(n - 1 - i, LOOPS - 2) // right-hand drums spin more
    if (to < from) to += 10 // never roll backwards

    // Jump back to the first loop (same digit, no visible change), then roll
    c.strip.style.transitionDuration = '0ms'
    place(c.strip, from)
    c.strip.offsetHeight

    const dur = base + (n - 1 - i) * stagger
    c.strip.style.transitionDuration = dur + 'ms'
    place(c.strip, to)
    c.col.classList.toggle('is-rolling', to !== from)

    clearTimeout(c.timer)
    c.timer = setTimeout(() => {
      c.col.classList.remove('is-rolling')
      c.strip.style.transitionDuration = '0ms'
      place(c.strip, target)
    }, dur)
  })
  value = next
  live.textContent = next
}

odo.addEventListener('click', () => {
  const n = cols.length
  let next
  do next = String(Math.floor(Math.random() * 10 ** n)).padStart(n, '0')
  while (next === value)
  rollTo(next)
})
