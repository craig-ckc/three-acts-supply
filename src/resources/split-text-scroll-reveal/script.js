gsap.registerPlugin(ScrollTrigger, SplitText)

const el = document.querySelector('[data-reveal]')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const css = getComputedStyle(el)
const duration = parseFloat(css.getPropertyValue('--duration')) || 1.2
const stagger = parseFloat(css.getPropertyValue('--stagger')) || 0.09
const start = 'top ' + (el.dataset.start || 80) + '%'

let triggers = []

SplitText.create(el, {
  type: 'lines',
  mask: 'lines',
  linesClass: 'line',
  autoSplit: true, // re-splits on resize and once fonts load
  onSplit(self) {
    triggers.forEach((t) => t.kill())

    const hidden = reduced ? { opacity: 0 } : { yPercent: 110, rotate: 2.5 }
    const shown = reduced ? { opacity: 1 } : { yPercent: 0, rotate: 0 }
    gsap.set(self.lines, { ...hidden, transformOrigin: '0% 0%' })
    gsap.set(el, { visibility: 'visible' })

    // Lines that cross the start point together reveal as one staggered group.
    const lineOf = (masks) => masks.map((m) => m.firstElementChild)
    triggers = ScrollTrigger.batch(self.masks, {
      start,
      onEnter: (masks) =>
        gsap.to(lineOf(masks), {
          ...shown,
          duration: reduced ? 0.4 : duration,
          stagger,
          ease: 'expo.out',
          overwrite: true,
        }),
      onLeaveBack: (masks) =>
        gsap.to(lineOf(masks).reverse(), {
          ...hidden,
          duration: reduced ? 0.2 : duration * 0.5,
          stagger: stagger * 0.5,
          ease: 'power3.in',
          overwrite: true,
        }),
    })
  },
})
