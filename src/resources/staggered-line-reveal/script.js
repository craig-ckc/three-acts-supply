const el = document.querySelector('[data-reveal]')
const text = el.textContent.trim()

// Wrap every word in a mask (.w) with an inner span that moves.
el.setAttribute('aria-label', text)
el.innerHTML = text
  .split(/\s+/)
  .map((w) => '<span class="w" aria-hidden="true"><span>' + w + '</span></span>')
  .join(' ')

const words = el.querySelectorAll('.w > span')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
const seconds = (name) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0

const play = () => {
  if (reduced.matches) {
    gsap.fromTo(words, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.03 })
    return
  }
  gsap.fromTo(
    words,
    { yPercent: 115, rotate: 5, transformOrigin: '0% 100%' },
    {
      yPercent: 0,
      rotate: 0,
      duration: seconds('--duration'),
      stagger: seconds('--stagger'),
      ease: 'expo.out',
      overwrite: true,
    }
  )
}

play()
el.addEventListener('click', play)
el.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    play()
  }
})
