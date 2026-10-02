const tabs = document.querySelector('.tabs')
const pill = tabs.querySelector('.tabs__pill')
const buttons = tabs.querySelectorAll('button')

function move(btn) {
  pill.style.width = btn.offsetWidth + 'px'
  pill.style.transform = `translateX(${btn.offsetLeft}px)`
}

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    buttons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)))
    move(btn)
  })
})

move(tabs.querySelector('[aria-selected="true"]'))
addEventListener('resize', () => move(tabs.querySelector('[aria-selected="true"]')))
