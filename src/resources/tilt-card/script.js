document.querySelectorAll('[data-tilt]').forEach((card) => {
  const max = 14
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    card.classList.add('is-moving')
    card.style.setProperty('--ry', (px - 0.5) * max * 2 + 'deg')
    card.style.setProperty('--rx', (0.5 - py) * max * 2 + 'deg')
    card.style.setProperty('--gx', px * 100 + '%')
    card.style.setProperty('--gy', py * 100 + '%')
  })
  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-moving')
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  })
})
