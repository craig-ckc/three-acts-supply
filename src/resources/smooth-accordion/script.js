const buttons = document.querySelectorAll('.acc__btn')

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true'
    buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'))
    btn.setAttribute('aria-expanded', String(!open))
  })
})
