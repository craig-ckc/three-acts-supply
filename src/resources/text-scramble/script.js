const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>?'
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
const randomGlyph = () => glyphs[(Math.random() * glyphs.length) | 0]

function scramble(el) {
  const final = el.dataset.text
  const out = el.querySelector('.scramble-text')
  if (reduceMotion.matches) return

  // Total time comes from the --duration custom property.
  const duration = parseFloat(getComputedStyle(el).getPropertyValue('--duration')) * 1000 || 600
  // Letters resolve left to right, with a little jitter so it decodes rather than wipes.
  const resolveAt = [...final].map((_, i) =>
    duration * (0.2 + 0.8 * ((i + Math.random() * 0.9) / final.length))
  )
  let current = [...final].map(randomGlyph)

  cancelAnimationFrame(el._raf)
  const start = performance.now()
  let lastSwap = start

  const tick = (now) => {
    const t = now - start
    // Swap glyphs every ~55ms rather than every frame, so they read as letters, not noise.
    const swap = now - lastSwap > 55
    if (swap) lastSwap = now
    out.innerHTML = [...final]
      .map((ch, i) => {
        if (t >= resolveAt[i] || ch === ' ') return ch
        if (swap) current[i] = randomGlyph()
        return `<span class="glyph">${current[i].replace('<', '&lt;').replace('>', '&gt;')}</span>`
      })
      .join('')
    if (t < duration) el._raf = requestAnimationFrame(tick)
    else out.textContent = final
  }
  el._raf = requestAnimationFrame(tick)
}

document.querySelectorAll('[data-scramble]').forEach((el) => {
  const text = el.textContent.trim()
  el.dataset.text = text
  el.setAttribute('aria-label', text)
  // The visible text sits over an invisible copy (see CSS), so the link keeps its width while scrambling.
  el.innerHTML = `<span class="scramble-text" aria-hidden="true">${text}</span>`
  el.addEventListener('pointerenter', () => scramble(el))
  el.addEventListener('focus', () => scramble(el))
})
