import type { Lib } from '../data/resources'

const GSAP_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0'
const LIB_ORDER: Lib[] = ['gsap', 'ScrollTrigger', 'Flip', 'SplitText', 'Draggable', 'Observer', 'CustomEase', 'InertiaPlugin']

/** Plugins imply core GSAP, and core always loads first. */
function libScripts(libs: Lib[]) {
  if (libs.length === 0) return ''
  const wanted = new Set<Lib>(['gsap', ...libs])
  return LIB_ORDER.filter((l) => wanted.has(l))
    .map((l) => `<script src="${GSAP_CDN}/${l}.min.js"></script>`)
    .join('\n')
}

export interface SrcDocInput {
  html: string
  css: string
  js: string
  libs?: Lib[]
  /** Static thumbnail: hide scrollbars so tiles never show native chrome. */
  thumbnail?: boolean
}

/**
 * Builds a self-contained document for a sandboxed iframe. Runtime errors are
 * forwarded to the parent via postMessage so the playground can surface them.
 */
export function buildSrcDoc({ html, css, js, libs = [], thumbnail = false }: SrcDocInput) {
  const scripts = libScripts(libs)
  // Prevent a literal </script> in user code from closing the tag early.
  const safeJs = js.replace(/<\/script/gi, '<\\/script')
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>*,*::before,*::after{box-sizing:border-box}${thumbnail ? 'html,body{scrollbar-width:none}::-webkit-scrollbar{display:none}' : ''}</style>
<style id="__live_css">${css}</style>
<script>
  window.addEventListener('error', function (e) {
    parent.postMessage({ type: 'preview-error', message: e.message }, '*')
  })
  // Forward app shortcuts so they keep working after the preview takes focus.
  window.addEventListener('keydown', function (e) {
    var t = e.target
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
    var mod = e.metaKey || e.ctrlKey
    var k = e.key.toLowerCase()
    if ((mod && (k === 'k' || k === 'b')) || (!mod && ['escape', 'f', 'e', '[', ']'].indexOf(k) > -1)) {
      if (mod) e.preventDefault()
      parent.postMessage({ type: 'preview-key', key: e.key, metaKey: e.metaKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey }, '*')
    }
  })
  // Hot CSS updates from the editor: swap styles without reloading the page.
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'set-css') document.getElementById('__live_css').textContent = e.data.css
  })
</script>
${scripts}
</head>
<body>
${html}
<script>
try {
${safeJs}
} catch (err) {
  parent.postMessage({ type: 'preview-error', message: String(err && err.message || err) }, '*')
}
</script>
</body>
</html>`
}
