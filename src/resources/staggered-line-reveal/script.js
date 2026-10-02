const el = document.querySelector('[data-reveal]')

el.innerHTML = el.textContent
  .trim()
  .split(/\s+/)
  .map((w) => '<span class="w"><span>' + w + '</span></span> ')
  .join('')

const play = () =>
  gsap.fromTo(
    el.querySelectorAll('.w > span'),
    { yPercent: 110, rotate: 4 },
    { yPercent: 0, rotate: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }
  )

play()
el.addEventListener('click', play)
