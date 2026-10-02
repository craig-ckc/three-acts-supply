document.querySelectorAll('.magnet').forEach((el) => {
  const strength = parseFloat(el.dataset.strength) || 0.4
  const label = el.querySelector('.magnet__label')

  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * strength
    const y = (e.clientY - r.top - r.height / 2) * strength
    el.classList.add('is-active')
    el.style.transform = `translate(${x}px, ${y}px)`
    label.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`
  })

  el.addEventListener('pointerleave', () => {
    el.classList.remove('is-active')
    el.style.transform = ''
    label.style.transform = ''
  })
})
