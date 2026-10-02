const bar = document.querySelector('.progress')

function update() {
  const max = document.documentElement.scrollHeight - innerHeight
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`
}

addEventListener('scroll', update, { passive: true })
addEventListener('resize', update)
update()
