const cursor = document.querySelector('.cursor')
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const follow = reduce ? 0 : parseFloat(cursor.dataset.follow) || 0.55

const xTo = gsap.quickTo(cursor, 'x', { duration: follow, ease: 'expo.out' })
const yTo = gsap.quickTo(cursor, 'y', { duration: follow, ease: 'expo.out' })
const moveTo = (x, y) => { xTo(x); yTo(y) }

// Rest the cursor on the word's centre, grown, until the pointer arrives.
const word = document.querySelector('[data-cursor-grow]')
const parkPoint = () => {
  const r = word.getBoundingClientRect()
  return { x: r.left + r.width * 0.62, y: r.top + r.height * 0.5 }
}
const park = () => {
  const p = parkPoint()
  moveTo(p.x, p.y)
  cursor.classList.add('is-big')
}
gsap.set(cursor, { xPercent: -50, yPercent: -50, ...parkPoint() })
park()
document.fonts.ready.then(() => { if (!moved) park() })

// Grow whenever the pointer is over a [data-cursor-grow] element.
let moved = false
addEventListener('pointermove', (e) => {
  moved = true
  moveTo(e.clientX, e.clientY)
  const over = document.elementFromPoint(e.clientX, e.clientY)
  cursor.classList.toggle('is-big', !!over?.closest('[data-cursor-grow]'))
})
addEventListener('pointerdown', (e) => {
  moveTo(e.clientX, e.clientY)
  cursor.classList.add('is-down')
})
addEventListener('pointerup', () => cursor.classList.remove('is-down'))
addEventListener('pointercancel', () => cursor.classList.remove('is-down'))
document.documentElement.addEventListener('pointerleave', park)
addEventListener('resize', () => { if (cursor.classList.contains('is-big')) park() })

document.querySelectorAll('[data-cursor-grow]').forEach((el) => {
  // Keyboard focus parks the lens on the word.
  el.addEventListener('focus', park)
  el.addEventListener('click', (e) => e.preventDefault())
})
