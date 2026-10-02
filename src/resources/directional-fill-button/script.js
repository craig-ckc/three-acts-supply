document.querySelectorAll('.dir-btn').forEach((btn) => {
  const fill = btn.querySelector('.dir-btn__fill')
  const place = (e) => {
    const r = btn.getBoundingClientRect()
    fill.style.left = e.clientX - r.left + 'px'
    fill.style.top = e.clientY - r.top + 'px'
  }
  btn.addEventListener('pointerenter', place)
  btn.addEventListener('pointerleave', place)
})
