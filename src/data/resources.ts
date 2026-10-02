export type Lib = 'gsap'

export interface Resource {
  slug: string
  title: string
  category: Category
  description: string
  tags: string[]
  addedDaysAgo: number
  free?: boolean
  libs?: Lib[]
  html: string
  css: string
  js: string
}

export const categories = [
  'Buttons',
  'Text Animations',
  'Cursor',
  'Sliders & Marquees',
  'Cards',
  'Forms',
  'Scroll',
  'Navigation',
  'Backgrounds',
  'Utilities',
] as const
export type Category = (typeof categories)[number]

export const categoryIcons: Record<Category, string> = {
  Buttons: 'button',
  'Text Animations': 'type',
  Cursor: 'cursor',
  'Sliders & Marquees': 'slider',
  Cards: 'card',
  Forms: 'form',
  Scroll: 'scroll',
  Navigation: 'compass',
  Backgrounds: 'sparkles',
  Utilities: 'wrench',
}

export const resources: Resource[] = [
  {
    slug: 'magnetic-button',
    title: 'Magnetic Button',
    category: 'Buttons',
    description:
      'A pill button that drifts toward the cursor while hovered and springs back when the pointer leaves. The label moves at half strength for a subtle parallax.',
    tags: ['Vanilla JS', 'Hover'],
    addedDaysAgo: 2,
    free: true,
    html: `<button class="magnet" data-strength="0.4">
  <span class="magnet__label">Get in touch</span>
</button>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #141414;
  font-family: system-ui, sans-serif;
}

.magnet {
  padding: 1.4em 2.6em;
  font-size: 1.1rem;
  font-weight: 600;
  color: #141414;
  background: #c6ff3d;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.magnet__label {
  display: inline-block;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.magnet.is-active,
.magnet.is-active .magnet__label {
  transition-duration: 0.15s;
}`,
    js: `document.querySelectorAll('.magnet').forEach((el) => {
  const strength = parseFloat(el.dataset.strength) || 0.4
  const label = el.querySelector('.magnet__label')

  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * strength
    const y = (e.clientY - r.top - r.height / 2) * strength
    el.classList.add('is-active')
    el.style.transform = \`translate(\${x}px, \${y}px)\`
    label.style.transform = \`translate(\${x * 0.5}px, \${y * 0.5}px)\`
  })

  el.addEventListener('pointerleave', () => {
    el.classList.remove('is-active')
    el.style.transform = ''
    label.style.transform = ''
  })
})`,
  },
  {
    slug: 'directional-fill-button',
    title: 'Directional Fill Button',
    category: 'Buttons',
    description:
      'The background circle enters from wherever your cursor crossed the edge, and exits the same way. Works with any number of buttons on the page.',
    tags: ['Vanilla JS', 'Hover'],
    addedDaysAgo: 9,
    html: `<div class="row">
  <a href="#" class="dir-btn"><span class="dir-btn__fill"></span><span class="dir-btn__text">Explore work</span></a>
  <a href="#" class="dir-btn"><span class="dir-btn__fill"></span><span class="dir-btn__text">Start a project</span></a>
</div>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #efeeec;
  font-family: system-ui, sans-serif;
}

.row { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

.dir-btn {
  position: relative;
  overflow: hidden;
  padding: 1.1em 2.2em;
  border: 1.5px solid #141414;
  border-radius: 999px;
  color: #141414;
  text-decoration: none;
  font-weight: 600;
  isolation: isolate;
  transition: color 0.4s;
}

.dir-btn__fill {
  position: absolute;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: #141414;
  transform: translate(-50%, -50%);
  transition: width 0.55s cubic-bezier(0.65, 0, 0.35, 1), height 0.55s cubic-bezier(0.65, 0, 0.35, 1);
  z-index: -1;
}

.dir-btn:hover { color: #c6ff3d; }
.dir-btn:hover .dir-btn__fill { width: 260%; height: 600%; }`,
    js: `document.querySelectorAll('.dir-btn').forEach((btn) => {
  const fill = btn.querySelector('.dir-btn__fill')
  const place = (e) => {
    const r = btn.getBoundingClientRect()
    fill.style.left = e.clientX - r.left + 'px'
    fill.style.top = e.clientY - r.top + 'px'
  }
  btn.addEventListener('pointerenter', place)
  btn.addEventListener('pointerleave', place)
})`,
  },
  {
    slug: 'text-scramble',
    title: 'Text Scramble on Hover',
    category: 'Text Animations',
    description:
      'Characters cycle through random glyphs before resolving left-to-right. Great for nav links and labels in a tech-flavoured design.',
    tags: ['Vanilla JS', 'Hover', 'Typography'],
    addedDaysAgo: 4,
    free: true,
    html: `<nav class="links">
  <a href="#" data-scramble>Index</a>
  <a href="#" data-scramble>Projects</a>
  <a href="#" data-scramble>Laboratory</a>
  <a href="#" data-scramble>Contact</a>
</nav>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #141414;
}

.links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: clamp(1.5rem, 5vw, 2.6rem);
  text-transform: uppercase;
}

.links a { color: #efeeec; text-decoration: none; }
.links a:hover { color: #c6ff3d; }`,
    js: `const glyphs = '!<>-_\\\\/[]{}—=+*^?#ABCDEFX01'

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
})`,
  },
  {
    slug: 'staggered-line-reveal',
    title: 'Staggered Word Reveal (GSAP)',
    category: 'Text Animations',
    description:
      'Splits a heading into words, masks each one, then slides them up with a stagger. Click the heading to replay.',
    tags: ['GSAP', 'Typography'],
    addedDaysAgo: 6,
    libs: ['gsap'],
    html: `<h1 class="reveal" data-reveal>
  We build digital things that feel alive
</h1>
<p class="hint">click to replay</p>`,
    css: `body {
  display: grid;
  place-content: center;
  min-height: 100vh;
  margin: 0;
  padding: 2rem;
  background: #efeeec;
  font-family: system-ui, sans-serif;
  text-align: center;
}

.reveal {
  max-width: 14ch;
  margin: 0 auto;
  font-size: clamp(2.4rem, 8vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  cursor: pointer;
}

.reveal .w { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.08em; }
.reveal .w > span { display: inline-block; }
.hint { color: #77756f; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; }`,
    js: `const el = document.querySelector('[data-reveal]')

el.innerHTML = el.textContent
  .trim()
  .split(/\\s+/)
  .map((w) => '<span class="w"><span>' + w + '</span></span> ')
  .join('')

const play = () =>
  gsap.fromTo(
    el.querySelectorAll('.w > span'),
    { yPercent: 110, rotate: 4 },
    { yPercent: 0, rotate: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }
  )

play()
el.addEventListener('click', play)`,
  },
  {
    slug: 'blend-cursor',
    title: 'Blend Mode Cursor (GSAP)',
    category: 'Cursor',
    description:
      'A smooth trailing cursor using gsap.quickTo with mix-blend-mode: difference. It grows over any element marked with data-cursor-grow.',
    tags: ['GSAP', 'Cursor'],
    addedDaysAgo: 12,
    libs: ['gsap'],
    html: `<div class="cursor"></div>
<main>
  <h2 data-cursor-grow>Hover me</h2>
  <p>Move your mouse around the frame.</p>
</main>`,
    css: `* { cursor: none; }
body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #efeeec;
  font-family: system-ui, sans-serif;
  text-align: center;
}

h2 { font-size: clamp(3rem, 10vw, 6rem); margin: 0; letter-spacing: -0.04em; }
p { color: #77756f; }

.cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 22px;
  height: 22px;
  margin: -11px 0 0 -11px;
  border-radius: 50%;
  background: #fff;
  mix-blend-mode: difference;
  pointer-events: none;
  z-index: 10;
  transition: width 0.3s, height 0.3s, margin 0.3s;
}

.cursor.is-big { width: 90px; height: 90px; margin: -45px 0 0 -45px; }`,
    js: `const cursor = document.querySelector('.cursor')
const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' })
const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' })

window.addEventListener('pointermove', (e) => {
  xTo(e.clientX)
  yTo(e.clientY)
})

document.querySelectorAll('[data-cursor-grow]').forEach((el) => {
  el.addEventListener('pointerenter', () => cursor.classList.add('is-big'))
  el.addEventListener('pointerleave', () => cursor.classList.remove('is-big'))
})`,
  },
  {
    slug: 'logo-marquee',
    title: 'Infinite Marquee (CSS)',
    category: 'Sliders & Marquees',
    description:
      'A pure-CSS seamless marquee. Duplicate the track once and translate by -50%. Pauses on hover and respects reduced-motion preferences.',
    tags: ['CSS only', 'Loop'],
    addedDaysAgo: 15,
    free: true,
    html: `<div class="marquee">
  <div class="marquee__track">
    <span>Strategy</span><span>✺</span><span>Design</span><span>✺</span>
    <span>Motion</span><span>✺</span><span>Development</span><span>✺</span>
    <span>Strategy</span><span>✺</span><span>Design</span><span>✺</span>
    <span>Motion</span><span>✺</span><span>Development</span><span>✺</span>
  </div>
</div>`,
    css: `body {
  display: grid;
  align-content: center;
  min-height: 100vh;
  margin: 0;
  background: #c6ff3d;
  font-family: system-ui, sans-serif;
  overflow: hidden;
}

.marquee { overflow: hidden; border-block: 2px solid #141414; padding: 1.2rem 0; }

.marquee__track {
  display: flex;
  gap: 2rem;
  width: max-content;
  font-size: clamp(2rem, 7vw, 4.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  animation: scroll 16s linear infinite;
}

.marquee:hover .marquee__track { animation-play-state: paused; }

@keyframes scroll { to { transform: translateX(calc(-50% - 1rem)); } }

@media (prefers-reduced-motion: reduce) {
  .marquee__track { animation: none; }
}`,
    js: ``,
  },
  {
    slug: 'draggable-slider',
    title: 'Draggable Card Slider (GSAP)',
    category: 'Sliders & Marquees',
    description:
      'Pointer-driven horizontal slider with momentum and edge resistance, built on gsap.quickTo — no Draggable plugin needed.',
    tags: ['GSAP', 'Drag'],
    addedDaysAgo: 21,
    libs: ['gsap'],
    html: `<div class="slider">
  <div class="slider__track">
    <article class="slide" style="--c:#6b4dff">01</article>
    <article class="slide" style="--c:#c6ff3d">02</article>
    <article class="slide" style="--c:#ff6b3d">03</article>
    <article class="slide" style="--c:#3dd2ff">04</article>
    <article class="slide" style="--c:#ffd23d">05</article>
    <article class="slide" style="--c:#ff3d8b">06</article>
  </div>
</div>`,
    css: `body {
  display: grid;
  align-content: center;
  min-height: 100vh;
  margin: 0;
  background: #141414;
  font-family: system-ui, sans-serif;
  overflow: hidden;
}

.slider { padding: 0 8vw; cursor: grab; touch-action: pan-y; user-select: none; }
.slider:active { cursor: grabbing; }
.slider__track { display: flex; gap: 1.25rem; width: max-content; }

.slide {
  display: grid;
  place-items: end start;
  width: min(60vw, 280px);
  aspect-ratio: 3 / 4;
  padding: 1.25rem;
  border-radius: 1.25rem;
  background: var(--c);
  font-size: 3rem;
  font-weight: 700;
  box-sizing: border-box;
}`,
    js: `const slider = document.querySelector('.slider')
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
slider.addEventListener('pointercancel', release)`,
  },
  {
    slug: 'tilt-card',
    title: '3D Tilt Card',
    category: 'Cards',
    description:
      'A card that tilts in 3D toward the pointer with a moving glare highlight. Uses CSS custom properties so all motion is GPU-friendly.',
    tags: ['Vanilla JS', '3D', 'Hover'],
    addedDaysAgo: 3,
    html: `<div class="tilt" data-tilt>
  <div class="tilt__inner">
    <span class="tilt__eyebrow">Membership</span>
    <h3>Act III</h3>
    <p>Every resource, every week.</p>
  </div>
</div>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #efeeec;
  font-family: system-ui, sans-serif;
  perspective: 900px;
}

.tilt {
  --rx: 0deg; --ry: 0deg; --gx: 50%; --gy: 50%;
  width: min(80vw, 320px);
  aspect-ratio: 4 / 5;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,.35), transparent 45%),
    linear-gradient(140deg, #6b4dff, #141414 70%);
  color: #fff;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 30px 60px -20px rgba(20,20,20,.5);
}

.tilt.is-moving { transition-duration: 0.1s; }

.tilt__inner {
  display: flex; flex-direction: column; justify-content: flex-end;
  height: 100%; padding: 1.75rem; box-sizing: border-box;
  transform: translateZ(40px);
}
.tilt__eyebrow { font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; color: #c6ff3d; }
.tilt h3 { font-size: 3rem; margin: .25rem 0; letter-spacing: -0.04em; }
.tilt p { margin: 0; opacity: .7; }`,
    js: `document.querySelectorAll('[data-tilt]').forEach((card) => {
  const max = 14
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    card.classList.add('is-moving')
    card.style.setProperty('--ry', (px - 0.5) * max * 2 + 'deg')
    card.style.setProperty('--rx', (0.5 - py) * max * 2 + 'deg')
    card.style.setProperty('--gx', px * 100 + '%')
    card.style.setProperty('--gy', py * 100 + '%')
  })
  card.addEventListener('pointerleave', () => {
    card.classList.remove('is-moving')
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  })
})`,
  },
  {
    slug: 'expanding-gallery',
    title: 'Expanding Panel Gallery',
    category: 'Cards',
    description:
      'Flex-based panels that expand on hover or focus. Pure CSS, keyboard accessible, and collapses into a vertical stack on small screens.',
    tags: ['CSS only', 'Hover'],
    addedDaysAgo: 18,
    free: true,
    html: `<div class="panels">
  <a href="#" class="panel" style="--bg:#6b4dff"><span>Act I</span></a>
  <a href="#" class="panel" style="--bg:#141414"><span>Act II</span></a>
  <a href="#" class="panel" style="--bg:#ff6b3d"><span>Act III</span></a>
  <a href="#" class="panel" style="--bg:#3dd2ff"><span>Encore</span></a>
</div>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 1.5rem;
  box-sizing: border-box;
  background: #efeeec;
  font-family: system-ui, sans-serif;
}

.panels { display: flex; gap: .6rem; width: min(100%, 760px); height: 380px; }

.panel {
  flex: 1;
  display: flex;
  align-items: flex-end;
  padding: 1.25rem;
  border-radius: 1.25rem;
  background: var(--bg);
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
  transition: flex 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  outline-offset: 3px;
}

.panel span { white-space: nowrap; opacity: .6; transition: opacity .4s; }
.panel:hover, .panel:focus-visible { flex: 4; }
.panel:hover span, .panel:focus-visible span { opacity: 1; }

@media (max-width: 520px) {
  .panels { flex-direction: column; height: 480px; }
}`,
    js: ``,
  },
  {
    slug: 'animated-checkbox',
    title: 'Animated Checkbox (CSS)',
    category: 'Forms',
    description:
      'Native checkbox restyled with appearance: none and an SVG tick drawn via stroke-dashoffset. Fully accessible, no JavaScript.',
    tags: ['CSS only', 'Forms'],
    addedDaysAgo: 7,
    free: true,
    html: `<form class="list">
  <label><input type="checkbox" checked /><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Set up project</label>
  <label><input type="checkbox" /><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Write first act</label>
  <label><input type="checkbox" /><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg> Ship it</label>
</form>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  background: #efeeec;
  font-family: system-ui, sans-serif;
}

.list { display: grid; gap: 1rem; font-size: 1.25rem; }

label { position: relative; display: flex; align-items: center; gap: .9rem; cursor: pointer; }

input {
  appearance: none;
  width: 1.6em; height: 1.6em;
  margin: 0;
  border: 2px solid #141414;
  border-radius: .45em;
  transition: background .3s, transform .2s;
  cursor: pointer;
}
input:active { transform: scale(.9); }
input:checked { background: #141414; }
input:focus-visible { outline: 3px solid #6b4dff; outline-offset: 2px; }

label svg {
  position: absolute; left: 0; width: 1.6em; height: 1.6em;
  fill: none; stroke: #c6ff3d; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 22; stroke-dashoffset: 22;
  transition: stroke-dashoffset .35s cubic-bezier(.65,0,.35,1) .05s;
  pointer-events: none;
}
input:checked + svg { stroke-dashoffset: 0; }`,
    js: ``,
  },
  {
    slug: 'smooth-accordion',
    title: 'Smooth Accordion',
    category: 'Forms',
    description:
      'Uses the grid-template-rows 0fr → 1fr trick to animate to auto height. Only one item open at a time, with aria-expanded kept in sync.',
    tags: ['Vanilla JS', 'Accessibility'],
    addedDaysAgo: 25,
    html: `<div class="acc">
  <div class="acc__item">
    <button class="acc__btn" aria-expanded="false">What is included? <i></i></button>
    <div class="acc__panel"><div><p>Every snippet, preview and future drop in the vault.</p></div></div>
  </div>
  <div class="acc__item">
    <button class="acc__btn" aria-expanded="false">Can I use it for clients? <i></i></button>
    <div class="acc__panel"><div><p>Yes — use resources in unlimited commercial projects.</p></div></div>
  </div>
  <div class="acc__item">
    <button class="acc__btn" aria-expanded="false">Do I need a framework? <i></i></button>
    <div class="acc__panel"><div><p>No. Everything is plain HTML, CSS and JavaScript.</p></div></div>
  </div>
</div>`,
    css: `body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 1.5rem;
  box-sizing: border-box;
  background: #efeeec;
  font-family: system-ui, sans-serif;
}

.acc { width: min(100%, 520px); border-top: 1px solid #d6d3cd; }
.acc__item { border-bottom: 1px solid #d6d3cd; }

.acc__btn {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; padding: 1.25rem 0;
  font: 600 1.1rem system-ui; color: #141414;
  background: none; border: 0; cursor: pointer; text-align: left;
}

.acc__btn i { position: relative; width: 14px; height: 14px; }
.acc__btn i::before, .acc__btn i::after {
  content: ''; position: absolute; inset: 6px 0 auto; height: 2px; background: currentColor;
  transition: transform .4s cubic-bezier(.65,0,.35,1);
}
.acc__btn i::after { transform: rotate(90deg); }
.acc__btn[aria-expanded="true"] i::after { transform: rotate(0); }

.acc__panel {
  display: grid; grid-template-rows: 0fr;
  transition: grid-template-rows .5s cubic-bezier(.65,0,.35,1);
}
.acc__panel > div { overflow: hidden; }
.acc__panel p { margin: 0 0 1.25rem; color: #77756f; }
.acc__btn[aria-expanded="true"] + .acc__panel { grid-template-rows: 1fr; }`,
    js: `const buttons = document.querySelectorAll('.acc__btn')

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true'
    buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'))
    btn.setAttribute('aria-expanded', String(!open))
  })
})`,
  },
  {
    slug: 'sticky-stack',
    title: 'Sticky Card Stack',
    category: 'Scroll',
    description:
      'Cards pin on top of each other as you scroll, each one scaling down slightly as the next arrives. Scroll inside the preview to try it.',
    tags: ['Vanilla JS', 'Scroll'],
    addedDaysAgo: 1,
    html: `<p class="intro">Scroll ↓</p>
<section class="stack">
  <article class="card" style="--bg:#6b4dff">Act I — Setup</article>
  <article class="card" style="--bg:#141414">Act II — Conflict</article>
  <article class="card" style="--bg:#ff6b3d">Act III — Resolution</article>
</section>
<p class="outro">Fin.</p>`,
    css: `body {
  margin: 0;
  background: #efeeec;
  font-family: system-ui, sans-serif;
}

.intro, .outro {
  display: grid; place-items: center; height: 60vh; margin: 0;
  color: #77756f; text-transform: uppercase; letter-spacing: .15em; font-size: .8rem;
}

.stack { padding: 0 1.5rem; }

.card {
  position: sticky;
  top: 10vh;
  display: grid; place-items: center;
  height: 70vh;
  margin-bottom: 8vh;
  border-radius: 1.5rem;
  background: var(--bg);
  color: #fff;
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  transform-origin: 50% 0;
  will-change: transform;
}`,
    js: `const cards = [...document.querySelectorAll('.card')]

function update() {
  cards.forEach((card, i) => {
    const next = cards[i + 1]
    if (!next) return
    const top = card.getBoundingClientRect().top
    const nextTop = next.getBoundingClientRect().top
    const progress = Math.min(1, Math.max(0, 1 - (nextTop - top) / card.offsetHeight))
    card.style.transform = \`scale(\${1 - progress * 0.08})\`
    card.style.filter = \`brightness(\${1 - progress * 0.35})\`
  })
}

addEventListener('scroll', update, { passive: true })
update()`,
  },
  {
    slug: 'mesh-gradient',
    title: 'Animated Mesh Gradient',
    category: 'Backgrounds',
    description:
      'Blurred, drifting colour blobs layered with a film-grain SVG filter. Pure CSS — tweak the custom properties to match any brand.',
    tags: ['CSS only', 'Ambient'],
    addedDaysAgo: 30,
    free: true,
    html: `<div class="mesh">
  <i></i><i></i><i></i>
  <h2>Ambient</h2>
</div>`,
    css: `body { margin: 0; font-family: system-ui, sans-serif; }

.mesh {
  --a: #6b4dff; --b: #c6ff3d; --c: #ff6b3d;
  position: relative;
  display: grid; place-items: center;
  min-height: 100vh;
  overflow: hidden;
  background: #141414;
  isolation: isolate;
}

.mesh i {
  position: absolute;
  width: 55vmax; height: 55vmax;
  border-radius: 50%;
  filter: blur(80px);
  opacity: .75;
  z-index: -1;
  animation: drift 14s ease-in-out infinite alternate;
}
.mesh i:nth-child(1) { background: var(--a); top: -20%; left: -10%; }
.mesh i:nth-child(2) { background: var(--b); bottom: -25%; right: -10%; animation-duration: 18s; animation-delay: -4s; }
.mesh i:nth-child(3) { background: var(--c); top: 30%; left: 35%; width: 35vmax; height: 35vmax; animation-duration: 11s; }

.mesh::after {
  content: ''; position: absolute; inset: 0; opacity: .18; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.mesh h2 { color: #fff; font-size: clamp(3rem, 12vw, 8rem); letter-spacing: -0.05em; margin: 0; mix-blend-mode: overlay; }

@keyframes drift {
  50% { transform: translate(10vw, 8vh) scale(1.15); }
  100% { transform: translate(-6vw, 12vh) scale(.9); }
}`,
    js: ``,
  },
  {
    slug: 'rolling-counter',
    title: 'Rolling Digit Counter',
    category: 'Text Animations',
    description:
      'Each digit is a vertical strip of 0–9 that rolls into place with a slight per-digit delay. Click to randomise the number.',
    tags: ['Vanilla JS', 'Numbers'],
    addedDaysAgo: 10,
    html: `<div class="counter" data-value="2048" aria-live="polite"></div>
<button class="shuffle">Randomise</button>`,
    css: `body {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 2rem;
  min-height: 100vh;
  margin: 0;
  background: #141414;
  font-family: system-ui, sans-serif;
}

.counter {
  display: flex;
  font-size: clamp(4rem, 16vw, 9rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #c6ff3d;
  font-variant-numeric: tabular-nums;
}

.digit { height: 1em; overflow: hidden; }
.digit__strip {
  display: flex; flex-direction: column;
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.shuffle {
  padding: .9em 1.8em; border: 1.5px solid #efeeec; border-radius: 999px;
  background: none; color: #efeeec; font-weight: 600; cursor: pointer;
}`,
    js: `const counter = document.querySelector('.counter')

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
})`,
  },
  {
    slug: 'scroll-progress-bar',
    title: 'Scroll Progress Bar',
    category: 'Utilities',
    description:
      'A thin bar pinned to the top of the viewport that fills as the reader scrolls. Uses a single transform for smooth, jank-free updates.',
    tags: ['Vanilla JS', 'Scroll'],
    addedDaysAgo: 0,
    free: true,
    html: `<div class="progress" aria-hidden="true"></div>
<article>
  <h1>Reading progress</h1>
  <p>Scroll this frame to watch the bar fill up.</p>
  <div class="filler"></div>
  <p>The end.</p>
</article>`,
    css: `body { margin: 0; background: #efeeec; font-family: system-ui, sans-serif; }

.progress {
  position: fixed; inset: 0 0 auto; height: 4px;
  background: #6b4dff;
  transform: scaleX(0);
  transform-origin: 0 50%;
  z-index: 10;
}

article { max-width: 36rem; margin: 0 auto; padding: 4rem 1.5rem; }
h1 { font-size: 3rem; letter-spacing: -0.04em; margin: 0 0 1rem; }
p { color: #77756f; }
.filler {
  height: 200vh; margin: 2rem 0; border-radius: 1rem;
  background: repeating-linear-gradient(#e5e3df 0 1px, transparent 1px 48px);
}`,
    js: `const bar = document.querySelector('.progress')

function update() {
  const max = document.documentElement.scrollHeight - innerHeight
  bar.style.transform = \`scaleX(\${max > 0 ? scrollY / max : 0})\`
}

addEventListener('scroll', update, { passive: true })
addEventListener('resize', update)
update()`,
  },
  {
    slug: 'underline-link',
    title: 'Underline Link Swipe',
    category: 'Navigation',
    description:
      'The underline draws in from the left on hover and exits to the right on leave — a two-direction swipe using only transform-origin.',
    tags: ['CSS only', 'Hover'],
    addedDaysAgo: 5,
    free: true,
    html: `<nav class="nav">
  <a href="#" class="u-link">Work</a>
  <a href="#" class="u-link">Studio</a>
  <a href="#" class="u-link">Journal</a>
  <a href="#" class="u-link">Contact</a>
</nav>`,
    css: `body {
  display: grid; place-items: center; min-height: 100vh; margin: 0;
  background: #efeeec; font-family: system-ui, sans-serif;
}

.nav { display: flex; gap: 2rem; font-size: 1.5rem; font-weight: 500; flex-wrap: wrap; justify-content: center; }

.u-link { position: relative; color: #141414; text-decoration: none; padding-bottom: 2px; }

.u-link::after {
  content: '';
  position: absolute; left: 0; right: 0; bottom: 0; height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform .5s cubic-bezier(.65,0,.35,1);
}

.u-link:hover::after, .u-link:focus-visible::after { transform: scaleX(1); transform-origin: left; }`,
    js: ``,
  },
  {
    slug: 'pill-tabs',
    title: 'Sliding Pill Tabs',
    category: 'Navigation',
    description:
      'A segmented control whose highlight glides between options. The indicator is measured from the active button so labels can be any width.',
    tags: ['Vanilla JS', 'Accessibility'],
    addedDaysAgo: 8,
    html: `<div class="tabs" role="tablist">
  <span class="tabs__pill"></span>
  <button role="tab" aria-selected="true">Overview</button>
  <button role="tab" aria-selected="false">Specs</button>
  <button role="tab" aria-selected="false">Reviews & ratings</button>
</div>`,
    css: `body {
  display: grid; place-items: center; min-height: 100vh; margin: 0;
  background: #141414; font-family: system-ui, sans-serif;
}

.tabs { position: relative; display: flex; padding: 4px; border-radius: 999px; background: #2a2a2a; }

.tabs button {
  position: relative; z-index: 1;
  padding: .75em 1.4em; border: 0; border-radius: 999px;
  background: none; color: #a3a19b; font: 600 .95rem system-ui; cursor: pointer;
  transition: color .3s;
}
.tabs button[aria-selected="true"] { color: #141414; }

.tabs__pill {
  position: absolute; top: 4px; bottom: 4px; left: 0;
  border-radius: 999px; background: #c6ff3d;
  transition: transform .5s cubic-bezier(.34,1.56,.64,1), width .5s cubic-bezier(.34,1.56,.64,1);
}`,
    js: `const tabs = document.querySelector('.tabs')
const pill = tabs.querySelector('.tabs__pill')
const buttons = tabs.querySelectorAll('button')

function move(btn) {
  pill.style.width = btn.offsetWidth + 'px'
  pill.style.transform = \`translateX(\${btn.offsetLeft}px)\`
}

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    buttons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)))
    move(btn)
  })
})

move(tabs.querySelector('[aria-selected="true"]'))
addEventListener('resize', () => move(tabs.querySelector('[aria-selected="true"]')))`,
  },
  {
    slug: 'css-tooltip',
    title: 'Tooltip (CSS only)',
    category: 'Utilities',
    description:
      'Attribute-driven tooltips: add data-tip to any element. Fades and nudges in on hover and keyboard focus, with no JavaScript.',
    tags: ['CSS only', 'Accessibility'],
    addedDaysAgo: 14,
    html: `<div class="row">
  <button data-tip="Copy to clipboard">Copy</button>
  <button data-tip="Share with your team">Share</button>
  <button data-tip="Delete forever">Delete</button>
</div>`,
    css: `body {
  display: grid; place-items: center; min-height: 100vh; margin: 0;
  background: #efeeec; font-family: system-ui, sans-serif;
}

.row { display: flex; gap: .75rem; }

button {
  padding: .8em 1.4em; border: 1.5px solid #141414; border-radius: .75rem;
  background: #fff; font: 600 1rem system-ui; cursor: pointer;
}

[data-tip] { position: relative; }

[data-tip]::after {
  content: attr(data-tip);
  position: absolute; left: 50%; bottom: calc(100% + 10px);
  padding: .45em .75em; border-radius: .5rem;
  background: #141414; color: #efeeec;
  font-size: .75rem; font-weight: 500; white-space: nowrap;
  opacity: 0; pointer-events: none;
  transform: translate(-50%, 6px);
  transition: opacity .2s, transform .3s cubic-bezier(.22,1,.36,1);
}

[data-tip]:hover::after, [data-tip]:focus-visible::after {
  opacity: 1; transform: translate(-50%, 0);
}`,
    js: ``,
  },
]

export const getResource = (slug: string) => resources.find((r) => r.slug === slug)
