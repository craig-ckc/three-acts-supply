import { chromium } from 'playwright'
import { mkdtemp, readdir, readFile, writeFile, mkdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { buildSrcDoc } from '../src/lib/buildSrcDoc.ts'

// Recording is an authoring step. No interaction code executes in gallery cards.
const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, 'public/previews')
const requested = process.argv.slice(2)
const width = 960
const height = 660
const duration = 6
const wait = (page, ms) => page.waitForTimeout(ms)
const ffmpeg = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args])

async function hover(page, selector) {
  const box = await page.locator(selector).first().boundingBox()
  if (!box) throw new Error(`Missing capture target: ${selector}`)
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5, { steps: 15 })
  await wait(page, 700)
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.4, { steps: 20 })
  await wait(page, 700)
  await page.mouse.move(20, 20, { steps: 15 })
  await wait(page, 500)
}

async function drag(page, selector) {
  const box = await page.locator(selector).boundingBox()
  await page.mouse.move(width * 0.72, box.y + box.height / 2)
  await page.mouse.down()
  for (let step = 0; step < 40; step++) {
    await page.mouse.move(width * (0.72 - step * 0.012), box.y + box.height / 2)
    await wait(page, 25)
  }
  await page.mouse.up()
  await wait(page, 1000)
  await page.locator(selector).press('ArrowRight')
}

async function scroll(page) {
  const maximum = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  for (let step = 0; step <= 90; step++) {
    const progress = step / 90
    await page.evaluate((y) => window.scrollTo(0, y), maximum * (0.5 - Math.cos(progress * Math.PI) / 2))
    await wait(page, 30)
  }
  await wait(page, 800)
  // Smoothly return to the first state for a calmer loop seam.
  for (let step = 0; step <= 45; step++) {
    await page.evaluate((y) => window.scrollTo(0, y), maximum * (1 - step / 45))
    await wait(page, 25)
  }
}

async function demonstrate(page, slug) {
  switch (slug) {
    case 'magnetic-button': return hover(page, '.magnet')
    case 'directional-fill-button': return hover(page, '.dir-btn')
    case 'tilt-card': return hover(page, '.tilt')
    case 'text-scramble':
    case 'underline-link':
    case 'expanding-gallery':
    case 'css-tooltip':
      for (const element of await page.locator('a, button').all()) {
        await element.hover()
        await wait(page, 650)
      }
      return page.mouse.move(20, 20)
    case 'animated-checkbox':
      for (const label of await page.locator('label').all()) {
        await label.click()
        await wait(page, 750)
      }
      return
    case 'pill-tabs':
    case 'flip-filter-grid':
    case 'smooth-accordion':
      for (const button of await page.locator('button').all()) {
        await button.click()
        await wait(page, 900)
      }
      return page.locator('button').first().click()
    case 'rolling-counter':
      await page.locator('button').click()
      await wait(page, 2500)
      return page.locator('button').click()
    case 'staggered-line-reveal':
      return page.locator('[data-reveal]').click()
    case 'scroll-progress-bar':
    case 'sticky-stack':
    case 'split-text-scroll-reveal':
      return scroll(page)
    case 'draggable-slider': return drag(page, '.slider')
    case 'infinite-drag-gallery': return drag(page, '.gallery')
    case 'image-trail-cursor':
    case 'blend-cursor':
    case 'mesh-gradient':
      for (let step = 0; step < 120; step++) {
        const angle = step / 120 * Math.PI * 4
        await page.mouse.move(width / 2 + Math.cos(angle) * 240, height / 2 + Math.sin(angle) * 140)
        await wait(page, 35)
      }
      return
    case 'velocity-marquee':
      await page.mouse.move(width / 2, height / 2)
      await page.mouse.wheel(0, 350)
      await wait(page, 2000)
      return page.mouse.wheel(0, -250)
    // The CSS logo marquee animates continuously without pointer input.
  }
}

await mkdir(output, { recursive: true })
const slugs = (await readdir(join(root, 'src/resources'))).sort()
for (const slug of requested) {
  if (!slugs.includes(slug)) throw new Error(`Unknown resource: ${slug}`)
}
// Chrome is convenient locally; PLAYWRIGHT_CHANNEL=chromium uses an installed
// Playwright Chromium in CI (npx playwright install chromium).
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true })
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
try {
  for (const slug of slugs.filter((s) => !requested.length || requested.includes(s))) {
    const directory = join(root, 'src/resources', slug)
    const metaPath = join(directory, 'meta.json')
    const meta = JSON.parse(await readFile(metaPath, 'utf8'))
    const read = async (name, optional = false) => {
      try { return await readFile(join(directory, name), 'utf8') }
      catch (error) { if (optional && error.code === 'ENOENT') return ''; throw error }
    }
    const doc = buildSrcDoc({ html: await read('index.html'), css: await read('style.css'), js: await read('script.js', true), libs: meta.libs, thumbnail: true })
    const temp = await mkdtemp(join(tmpdir(), 'supply-preview-'))
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    try {
      await page.setContent(doc.replace('<head>', `<head><script>window.__captureErrors=[];window.addEventListener('message',e=>{if(e.data?.type==='preview-error')window.__captureErrors.push(e.data.message)})</script>`), { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await wait(page, 500)
      if (slug === 'split-text-scroll-reveal') {
        await page.evaluate(() => window.scrollTo(0, 220))
        await wait(page, 1500)
      }
      if (slug === 'image-trail-cursor') {
        for (let step = 0; step < 8; step++) await page.mouse.move(250 + step * 60, 330 + Math.sin(step) * 100)
        await wait(page, 100)
      }
      await page.screenshot({ path: join(temp, 'poster.png') })
      ffmpeg(['-i', join(temp, 'poster.png'), '-vf', 'scale=640:440:flags=lanczos', '-quality', '82', join(output, `${slug}.webp`)])

      const session = await page.context().newCDPSession(page)
      const frames = []
      session.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
        frames.push({ data, timestamp: metadata.timestamp })
        session.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
      })
      await session.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 960, maxHeight: 660, everyNthFrame: 1 })
      const started = Date.now()
      await demonstrate(page, slug)
      await wait(page, Math.max(100, duration * 1000 - (Date.now() - started)))
      await session.send('Page.stopScreencast')
      await session.detach()
      errors.push(...await page.evaluate(() => window.__captureErrors))
      if (errors.length) throw new Error(`${slug}: ${errors.join('; ')}`)
      if (frames.length < 2) throw new Error(`${slug}: no motion frames recorded`)

      const concat = ['ffconcat version 1.0']
      for (let index = 0; index < frames.length; index++) {
        const name = `${index}.jpg`
        await writeFile(join(temp, name), Buffer.from(frames[index].data, 'base64'))
        concat.push(`file '${name}'`, `duration ${Math.max(0.001, index + 1 < frames.length ? frames[index + 1].timestamp - frames[index].timestamp : Math.max(0.1, duration - (frames[index].timestamp - frames[0].timestamp)))}`)
      }
      concat.push(`file '${frames.length - 1}.jpg'`)
      await writeFile(join(temp, 'frames.txt'), concat.join('\n'))
      // Keep sharp type and 30fps motion; no audio, thumbnail resolution, slow
      // H.264 compression, and fast-start metadata for immediate playback.
      ffmpeg(['-safe', '0', '-f', 'concat', '-i', join(temp, 'frames.txt'), '-vf', 'scale=640:440:flags=lanczos,fps=30', '-t', String(duration), '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(output, `${slug}.mp4`)])
      meta.preview = { video: `/previews/${slug}.mp4`, poster: `/previews/${slug}.webp` }
      await writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`)
      const bytes = (await stat(join(output, `${slug}.mp4`))).size
      console.log(`${slug}: ${(bytes / 1024).toFixed(1)} KB, ${frames.length} captured frames`)
    } finally {
      await page.close()
      await rm(temp, { recursive: true, force: true })
    }
  }
} finally {
  await browser.close()
}
