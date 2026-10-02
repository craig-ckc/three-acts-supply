// One Flip: record tile positions, change the filter, animate from the old layout.
gsap.registerPlugin(Flip)

document.querySelectorAll('.filter').forEach((root) => {
  const chips = [...root.querySelectorAll('.filter__chip')]
  const tiles = [...root.querySelectorAll('.filter__tile')]
  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  let flip

  function apply(group) {
    const duration = reduce.matches ? 0 : parseFloat(getComputedStyle(root).getPropertyValue('--duration')) || 0.8
    const stagger = parseFloat(root.dataset.stagger) || 0
    const state = Flip.getState(tiles) // capture now, even mid-animation
    if (flip) flip.kill()
    gsap.killTweensOf(tiles)

    tiles.forEach((t) => t.classList.toggle('is-hidden', group !== 'all' && t.dataset.group !== group))
    gsap.set(tiles.filter((t) => !t.classList.contains('is-hidden')), { scale: 1, opacity: 1 }) // end state; Flip tweens from the captured one

    flip = Flip.from(state, {
      duration,
      ease: 'expo.out',
      stagger,
      props: 'opacity',
      absolute: true, // leaving tiles stay in place while the rest re-flow
      onEnter: (els) => gsap.fromTo(els, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration, ease: 'expo.out', stagger }),
      onLeave: (els) => gsap.to(els, { scale: 0.4, opacity: 0, duration: duration * 0.5, ease: 'power3.out' }),
    })
  }

  function select(chip, focus) {
    chips.forEach((c) => {
      c.setAttribute('aria-checked', String(c === chip))
      c.tabIndex = c === chip ? 0 : -1
    })
    if (focus) chip.focus()
    apply(chip.dataset.filter)
  }

  chips.forEach((chip, i) => {
    chip.tabIndex = chip.getAttribute('aria-checked') === 'true' ? 0 : -1
    chip.addEventListener('click', () => chip.getAttribute('aria-checked') !== 'true' && select(chip))
    chip.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
      if (!step) return
      e.preventDefault()
      select(chips[(i + step + chips.length) % chips.length], true)
    })
  })
})
