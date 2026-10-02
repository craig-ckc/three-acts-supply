const glyphs = '!<>-_\\/[]{}—=+*^?#ABCDEFX01'

function scramble(el) {
  const final = el.dataset.text || el.textContent
  el.dataset.text = final
  let frame = 0
  cancelAnimationFrame(el._raf)
  const tick = () => {
    el.textContent = final
      .split('')
      .map((ch, i) => (i < frame / 2 ? ch : glyphs[(Math.random() * glyphs.length) | 0]))
      .join('')
    if (frame / 2 < final.length) {
      frame++
      el._raf = requestAnimationFrame(tick)
    }
  }
  tick()
}

document.querySelectorAll('[data-scramble]').forEach((el) => {
  el.addEventListener('pointerenter', () => scramble(el))
})
