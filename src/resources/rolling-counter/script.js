const counter = document.querySelector('.counter')

function render(value) {
  const str = String(value)
  while (counter.children.length < str.length) {
    const d = document.createElement('div')
    d.className = 'digit'
    d.innerHTML = '<div class="digit__strip">' + [...Array(10).keys()].map((n) => '<span>' + n + '</span>').join('') + '</div>'
    counter.prepend(d)
  }
  while (counter.children.length > str.length) counter.firstChild.remove()
  ;[...counter.children].forEach((d, i) => {
    const strip = d.firstChild
    strip.style.transitionDelay = i * 0.07 + 's'
    requestAnimationFrame(() => (strip.style.transform = 'translateY(-' + str[i] * 10 + '%)'))
  })
}

render(counter.dataset.value)
document.querySelector('.shuffle').addEventListener('click', () => {
  render(Math.floor(Math.random() * 99999))
})
