// One magnetic function: the button and its label chase the pointer
// with a damped spring, each at its own strength, and spring home on leave.
document.querySelectorAll('.magnet').forEach((el) => {
  const strength = parseFloat(el.dataset.strength) || 0.3
  const labelStrength = parseFloat(el.dataset.labelStrength) || 0.12
  const field = parseFloat(el.dataset.field) || 60 // px of pull around the button
  const label = el.querySelector('.magnet__label')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')

  const spring = () => ({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 })
  const btn = spring()
  const lbl = spring()
  let raf = 0

  const step = (s) => {
    // stiffness / damping tuned for a soft, slightly bouncy return
    s.vx = (s.vx + (s.tx - s.x) * 0.12) * 0.78
    s.vy = (s.vy + (s.ty - s.y) * 0.12) * 0.78
    s.x += s.vx
    s.y += s.vy
    const moving = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) + Math.abs(s.vx) + Math.abs(s.vy) > 0.02
    if (!moving) { s.x = s.tx; s.y = s.ty } // settle exactly on target
    return moving
  }

  const tick = () => {
    const moving = step(btn) | step(lbl)
    el.style.transform = `translate3d(${btn.x}px, ${btn.y}px, 0)`
    label.style.transform = `translate3d(${lbl.x}px, ${lbl.y}px, 0)`
    raf = moving ? requestAnimationFrame(tick) : 0
  }

  const aim = (dx, dy) => {
    btn.tx = dx * strength
    btn.ty = dy * strength
    lbl.tx = dx * labelStrength
    lbl.ty = dy * labelStrength
    if (!raf) raf = requestAnimationFrame(tick)
  }

  window.addEventListener('pointermove', (e) => {
    if (reduce.matches) return
    const r = el.getBoundingClientRect()
    // measure from the resting centre, not the shifted one
    const cx = r.left + r.width / 2 - btn.x
    const cy = r.top + r.height / 2 - btn.y
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const inside = Math.abs(dx) < r.width / 2 + field && Math.abs(dy) < r.height / 2 + field
    inside ? aim(dx, dy) : aim(0, 0)
  })

  const release = () => aim(0, 0)
  document.documentElement.addEventListener('pointerleave', release)
  window.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && release())
  window.addEventListener('pointercancel', release)
  window.addEventListener('blur', release)
})
