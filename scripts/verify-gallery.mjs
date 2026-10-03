import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const url = process.env.SUPPLY_URL || 'http://127.0.0.1:5174'
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' })
const errors = []
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
page.on('pageerror', (error) => errors.push(error.message))
const waitForPlayback = () => page.waitForFunction(() => [...document.querySelectorAll('video')].some((v) => !v.paused && v.currentTime > 0))
try {
  await page.goto(url)
  await page.getByRole('heading', { name: 'Welcome to the Vault' }).waitFor()
  assert.equal(await page.locator('iframe').count(), 0, 'Gallery must not run resource code')
  assert.equal(await page.getByText('Nico', { exact: true }).count(), 0, 'User footer removed')
  await page.getByRole('textbox', { name: 'Filter by name, category or tag' }).fill('Magnetic Button')
  await waitForPlayback()
  assert.equal(await page.locator('video').count(), 1)
  await page.getByRole('button', { name: 'More actions for Magnetic Button' }).click()
  await page.getByRole('menuitem', { name: 'Bookmark', exact: true }).click()
  assert.equal(await page.getByRole('button', { name: 'Remove Magnetic Button from bookmarks' }).getAttribute('aria-pressed'), 'true')
  await page.getByRole('button', { name: 'Remove Magnetic Button from bookmarks' }).click()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForFunction(() => document.querySelectorAll('video').length === 0)
  assert.equal(await page.locator('img').count(), 1, 'Reduced motion retains a still preview')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await waitForPlayback()

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.waitForFunction(() => document.querySelectorAll('video').length === 0)
  await page.evaluate(() => {
    delete document.visibilityState
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await waitForPlayback()
  await page.getByRole('link', { name: 'Magnetic Button', exact: true }).click()
  await page.locator('iframe').waitFor()
  assert.equal(await page.locator('iframe').count(), 1, 'Opening a resource still runs its editable preview')

  const failurePage = await context.newPage()
  await failurePage.route('**/previews/magnetic-button.mp4', (route) => route.abort())
  await failurePage.goto(url)
  const failedRequest = failurePage.waitForRequest('**/previews/magnetic-button.mp4')
  await failurePage.getByRole('textbox', { name: 'Filter by name, category or tag' }).fill('Magnetic Button')
  await failedRequest
  await failurePage.waitForFunction(() => document.querySelector('img')?.complete && document.querySelectorAll('video').length === 0)
  assert.ok(await failurePage.locator('img').evaluate((img) => img.naturalWidth > 0), 'Video failure retains a valid poster')
  await failurePage.close()

  // Simulate a large catalogue through Vite's data module, without modifying
  // fixtures or running hundreds of resource interactions to create the test.
  const stress = await context.newPage()
  stress.on('pageerror', (error) => errors.push(error.message))
  await stress.route('**/src/data/resources.ts*', async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    await route.fulfill({ response, body: `${source}\nconst template=resources.find(r=>r.slug==='magnetic-button');resources.splice(0,resources.length,...Array.from({length:500},(_,i)=>({...template,slug:'stress-'+i,title:'Resource '+i})));` })
  })
  await stress.goto(url)
  await stress.getByText('500 resources, each with a live, editable preview').waitFor()
  await stress.waitForFunction(() => [...document.querySelectorAll('video')].some((v) => !v.paused && v.currentTime > 0))
  const initial = await stress.locator('video').count()
  assert.ok(initial > 0 && initial < 15, `Only visible cards load videos: ${initial}`)
  assert.equal(await stress.locator('iframe').count(), 0)
  await stress.evaluate(() => { window.__previousVideos = [...document.querySelectorAll('video')] })
  await stress.getByRole('link', { name: 'Resource 499', exact: true }).scrollIntoViewIfNeeded()
  await stress.waitForFunction(() => window.__previousVideos.every((v) => !v.isConnected && v.paused && !v.getAttribute('src')))
  const afterScroll = await stress.locator('video').count()
  assert.ok(afterScroll > 0 && afterScroll < 15, `Video count stays bounded after scrolling: ${afterScroll}`)
  await stress.getByRole('textbox', { name: 'Filter by name, category or tag' }).fill('Resource 499')
  await stress.waitForFunction(() => document.querySelectorAll('video').length === 1)
  assert.equal(await stress.locator('iframe').count(), 0)
  console.log(`500-card check: ${initial} visible videos initially, ${afterScroll} after scrolling, 1 after filtering; 0 gallery iframes.`)
  assert.deepEqual(errors, [], 'No browser runtime errors')
  console.log('Gallery verification passed: playback, cleanup, reduced motion, hidden tabs, media failure, bookmarks, and live resource navigation.')
} finally {
  await browser.close()
}
