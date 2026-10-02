// Sticky stack: each card's --depth = how far the cards after it have stacked on top.
const cards = [...document.querySelectorAll('.stack-card')]
let stickyTops = []
let queued = false

function measure() {
  stickyTops = cards.map((card) => parseFloat(getComputedStyle(card).top))
  update()
}

function update() {
  queued = false
  // progress of each card arriving onto the one before it (0 = away, 1 = stacked)
  const arrived = cards.map((card, i) => {
    if (i === 0) return 0
    const travel = cards[i - 1].offsetHeight
    const distance = card.getBoundingClientRect().top - stickyTops[i]
    return Math.min(1, Math.max(0, 1 - distance / travel))
  })
  cards.forEach((card, i) => {
    const depth = arrived.slice(i + 1).reduce((sum, p) => sum + p, 0)
    card.style.setProperty('--depth', depth.toFixed(4))
  })
}

addEventListener('scroll', () => {
  if (!queued) { queued = true; requestAnimationFrame(update) }
}, { passive: true })
addEventListener('resize', measure)
measure()
