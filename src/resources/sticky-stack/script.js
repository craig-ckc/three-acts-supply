const cards = [...document.querySelectorAll('.card')]

function update() {
  cards.forEach((card, i) => {
    const next = cards[i + 1]
    if (!next) return
    const top = card.getBoundingClientRect().top
    const nextTop = next.getBoundingClientRect().top
    const progress = Math.min(1, Math.max(0, 1 - (nextTop - top) / card.offsetHeight))
    card.style.transform = `scale(${1 - progress * 0.08})`
    card.style.filter = `brightness(${1 - progress * 0.35})`
  })
}

addEventListener('scroll', update, { passive: true })
update()
