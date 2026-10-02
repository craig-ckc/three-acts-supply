// The fill grows from where the pointer crossed the edge, and shrinks
// toward where it leaves. Timing and easing live in style.css.
document.querySelectorAll('.dir-btn').forEach((btn) => {
  const fill = btn.querySelector('.dir-btn__fill')
  const progress = () => parseFloat(getComputedStyle(btn).getPropertyValue('--p')) || 0

  const aim = (x, y) => {
    fill.style.setProperty('--x', x + 'px')
    fill.style.setProperty('--y', y + 'px')
  }
  // Snap the pointer to the nearest edge so the fill starts exactly on the border.
  const aimAt = (e) => {
    const r = btn.getBoundingClientRect()
    let x = Math.min(Math.max(e.clientX - r.left, 0), r.width)
    let y = Math.min(Math.max(e.clientY - r.top, 0), r.height)
    const edges = [x, r.width - x, y, r.height - y]
    const i = edges.indexOf(Math.min(...edges))
    if (i === 0) x = 0
    else if (i === 1) x = r.width
    else if (i === 2) y = 0
    else y = r.height
    aim(x, y)
  }

  btn.addEventListener('pointerenter', (e) => {
    if (progress() < 0.05) aimAt(e) // mid-exit, just reverse in place
    btn.classList.add('is-on')
  })

  btn.addEventListener('pointerleave', (e) => {
    if (progress() > 0.95) aimAt(e) // fully covered: retreat toward the exit
    if (!btn.matches(':focus-visible')) btn.classList.remove('is-on')
  })

  // Keyboard: fill from the leading edge.
  btn.addEventListener('focus', () => {
    if (!btn.matches(':focus-visible')) return
    if (progress() < 0.05) aim(0, btn.offsetHeight / 2)
    btn.classList.add('is-on')
  })
  btn.addEventListener('blur', () => {
    if (!btn.matches(':hover')) btn.classList.remove('is-on')
  })
})
