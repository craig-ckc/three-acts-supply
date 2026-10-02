// Sliding pill: the leading edge leaves first, the trailing edge catches up.
document.querySelectorAll('.seg').forEach((seg) => {
  const options = [...seg.querySelectorAll('.seg__option')]

  // Ink layer holding a copy of every label, so text recolours exactly at the pill's edge
  const pill = document.createElement('div')
  pill.className = 'seg__pill'
  pill.setAttribute('aria-hidden', 'true')
  options.forEach((o) => {
    const s = document.createElement('span')
    s.className = 'seg__option'
    s.textContent = o.textContent
    pill.append(s)
  })
  seg.append(pill)

  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  const ease = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)) // expo out
  let l = 0, r = 0, raf = 0

  const edges = (btn) => [btn.offsetLeft, seg.clientWidth - btn.offsetLeft - btn.offsetWidth]
  const paint = () => {
    pill.style.setProperty('--l', l + 'px')
    pill.style.setProperty('--r', r + 'px')
  }

  function moveTo(btn, instant) {
    cancelAnimationFrame(raf)
    const [tl, tr] = edges(btn)
    const dur = parseFloat(seg.dataset.duration) || 0
    if (instant || reduce.matches || !dur) { l = tl; r = tr; return paint() }

    const fl = l, fr = r, start = performance.now()
    const right = tl > fl // moving right: right edge leads
    const fast = dur * 0.55, slow = dur

    const tick = (now) => {
      const t = now - start
      l = fl + (tl - fl) * ease(t / (right ? slow : fast))
      r = fr + (tr - fr) * ease(t / (right ? fast : slow))
      paint()
      if (t < slow) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  function select(btn, focus) {
    options.forEach((o) => {
      o.setAttribute('aria-checked', String(o === btn))
      o.tabIndex = o === btn ? 0 : -1
    })
    if (focus) btn.focus()
    moveTo(btn)
  }

  options.forEach((o, i) => {
    o.addEventListener('click', () => select(o))
    o.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
      if (!step) return
      e.preventDefault()
      select(options[(i + step + options.length) % options.length], true)
    })
  })

  const current = () => seg.querySelector('[aria-checked="true"]') || options[0]
  options.forEach((o) => (o.tabIndex = o === current() ? 0 : -1))
  moveTo(current(), true)
  new ResizeObserver(() => moveTo(current(), true)).observe(seg)
  document.fonts && document.fonts.ready.then(() => moveTo(current(), true))
})
