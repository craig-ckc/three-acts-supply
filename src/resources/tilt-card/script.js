// Tilt toward the pointer. Each value eases toward its target every frame,
// so the motion stays smooth and can be interrupted at any point.
document.querySelectorAll('[data-tilt]').forEach((card) => {
  const max = parseFloat(card.dataset.max) || 14
  const rest = { rx: 0, ry: 0, gx: 50, gy: 30, hover: 0 }
  const now = { ...rest }
  let target = { ...rest }
  let frame = 0

  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches

  function aim(px, py) {
    // px, py: 0..1 across the card
    const t = still() ? 0 : 1
    target = {
      rx: (0.5 - py) * max * 2 * t,
      ry: (px - 0.5) * max * 2 * t,
      gx: px * 100,
      gy: py * 100,
      hover: 1,
    }
    run()
  }

  function reset() {
    target = { ...rest }
    run()
  }

  function tick() {
    let moving = false
    for (const k in now) {
      now[k] += (target[k] - now[k]) * 0.12
      if (Math.abs(target[k] - now[k]) > 0.01) moving = true
      else now[k] = target[k]
    }
    card.style.setProperty('--rx', now.rx.toFixed(2) + 'deg')
    card.style.setProperty('--ry', now.ry.toFixed(2) + 'deg')
    card.style.setProperty('--gx', now.gx.toFixed(1) + '%')
    card.style.setProperty('--gy', now.gy.toFixed(1) + '%')
    card.style.setProperty('--hover', now.hover.toFixed(3))
    frame = moving ? requestAnimationFrame(tick) : 0
  }

  function run() {
    if (!frame) frame = requestAnimationFrame(tick)
  }

  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect()
    aim((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
  })
  card.addEventListener('pointerleave', reset)
  card.addEventListener('pointercancel', reset)
  card.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && reset())

  // Keyboard focus presents the card at an angle
  card.addEventListener('focus', () => card.matches(':focus-visible') && aim(0.8, 0.25))
  card.addEventListener('blur', reset)
  card.addEventListener('click', (e) => card.getAttribute('href') === '#' && e.preventDefault())
})
