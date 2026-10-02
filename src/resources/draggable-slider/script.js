const slider = document.querySelector('.slider')
const track = slider.querySelector('.slider__track')
const xTo = gsap.quickTo(track, 'x', { duration: 0.8, ease: 'power3' })

let x = 0, startX = 0, startPos = 0, dragging = false, lastX = 0, velocity = 0

const bounds = () => Math.min(0, slider.clientWidth - track.scrollWidth - parseFloat(getComputedStyle(slider).paddingLeft) * 2)

slider.addEventListener('pointerdown', (e) => {
  dragging = true
  startX = lastX = e.clientX
  startPos = x
  slider.setPointerCapture(e.pointerId)
})

slider.addEventListener('pointermove', (e) => {
  if (!dragging) return
  velocity = e.clientX - lastX
  lastX = e.clientX
  let next = startPos + (e.clientX - startX)
  const min = bounds()
  if (next > 0) next *= 0.35
  if (next < min) next = min + (next - min) * 0.35
  x = next
  xTo(x)
})

const release = () => {
  if (!dragging) return
  dragging = false
  x = gsap.utils.clamp(bounds(), 0, x + velocity * 12)
  xTo(x)
}
slider.addEventListener('pointerup', release)
slider.addEventListener('pointercancel', release)
