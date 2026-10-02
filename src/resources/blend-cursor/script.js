const cursor = document.querySelector('.cursor')
const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' })
const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' })

window.addEventListener('pointermove', (e) => {
  xTo(e.clientX)
  yTo(e.clientY)
})

document.querySelectorAll('[data-cursor-grow]').forEach((el) => {
  el.addEventListener('pointerenter', () => cursor.classList.add('is-big'))
  el.addEventListener('pointerleave', () => cursor.classList.remove('is-big'))
})
