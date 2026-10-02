// Reading progress: the fill eases toward the scroll position, the bar
// thickens with scroll speed, and the lime head sweeps across at 100%.
const bar = document.querySelector('.progress')
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

let target = 0, p = 0, v = 0, lastY = scrollY, raf = 0

function measure() {
  const max = document.documentElement.scrollHeight - innerHeight
  return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
}

function tick() {
  const dy = Math.abs(scrollY - lastY)
  lastY = scrollY

  p += (target - p) * (reduced ? 1 : 0.18)          // exponential follow
  v += (Math.min(dy / 40, 1) - v) * (reduced ? 0 : 0.12) // speed -> thickness

  bar.style.setProperty('--p', p.toFixed(4))
  bar.style.setProperty('--v', v.toFixed(3))
  bar.classList.toggle('is-done', target > 0.995)

  // keep running only while something is still moving
  if (Math.abs(target - p) > 0.0005 || v > 0.002) raf = requestAnimationFrame(tick)
  else { p = target; v = 0; raf = 0; bar.style.setProperty('--p', p); bar.style.setProperty('--v', 0) }
}

function update() {
  target = measure()
  if (!raf) raf = requestAnimationFrame(tick)
}

addEventListener('scroll', update, { passive: true })
addEventListener('resize', update)
update()
