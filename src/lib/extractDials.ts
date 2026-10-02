/**
 * Scans a resource's CSS and HTML for tweakable values (colours, lengths,
 * durations, easings, numeric data-attributes) and turns each into a "dial"
 * that knows exactly which characters of the source it controls.
 */
export type DialKind = 'number' | 'color' | 'easing'

export interface Dial {
  key: string
  source: 'css' | 'html'
  folder: string
  label: string
  kind: DialKind
  start: number
  end: number
  raw: string
  value: number | string
  unit: string
}

export interface Range {
  min: number
  max: number
  step: number
}

const UNITLESS_PROPS = new Set(['opacity', 'font-weight', 'line-height', 'flex', 'flex-grow', 'scale', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset'])
const SKIP_PROPS = new Set(['z-index', 'content', 'grid-area', 'order', 'font-family', 'font', 'background-image'])
const TOKEN = /(#[0-9a-fA-F]{3,8}\b)|(cubic-bezier\([^)]*\))|(?<![\w#.-])(-?\d*\.?\d+)(px|rem|em|ms|s|deg|%|vw|vh|vmax|vmin|fr|ch)?(?![\w(])/g

const SIDES: Record<number, string[]> = {
  2: ['block', 'inline'],
  3: ['top', 'inline', 'bottom'],
  4: ['top', 'right', 'bottom', 'left'],
}
const BOX_PROPS = new Set(['padding', 'margin', 'inset', 'border-radius', 'scroll-margin', 'scroll-padding'])
const AXES = ['x', 'y', 'z']

/** For each character, the innermost enclosing CSS function name and where it starts. */
function functionContext(value: string) {
  const ctx: { fn: string; start: number }[] = []
  const stack: { fn: string; start: number }[] = []
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (ch === '(') {
      const name = (value.slice(0, i).match(/([\w-]+)$/)?.[1] ?? '').toLowerCase()
      // calc()/var() are transparent: their tokens belong to the enclosing function.
      const parent = stack[stack.length - 1] ?? { fn: '', start: -1 }
      stack.push(name === 'calc' || name === 'var' ? parent : { fn: name, start: i })
    } else if (ch === ')') stack.pop()
    ctx[i] = stack[stack.length - 1] ?? { fn: '', start: -1 }
  }
  return ctx
}

type Found = Omit<Dial, 'label' | 'key'> & { at: number; skip?: boolean }

/** Name each token by what it does, so the panel reads "padding · inline", not "padding 2". */
function nameTokens(prop: string, value: string, found: Found[]): string[] {
  const ctx = functionContext(value)
  const groupIndex = new Map<number, number>()
  const roles = found.map((t) => {
    const c = ctx[t.at] ?? { fn: '', start: -1 }
    const i = groupIndex.get(c.start) ?? 0
    groupIndex.set(c.start, i + 1)
    const fn = c.fn
    if (fn === 'clamp') return ['min', 'ideal', 'max'][i] ?? `${i + 1}`
    if (fn === 'min' || fn === 'max') return t.unit || 'value'
    if (/^translate3d$|^translate$/.test(fn)) return `translate ${AXES[i] ?? i + 1}`
    if (/^translate[xyz]$/.test(fn)) return `translate ${fn.slice(-1)}`
    if (/^rotate/.test(fn)) return 'rotate'
    if (/^scale/.test(fn)) return 'scale'
    if (/gradient$/.test(fn)) {
      if (t.kind === 'color') return 'colour'
      if (t.unit === 'deg') return 'angle'
      return 'stop'
    }
    return ''
  })

  // Shorthand roles apply only to tokens that sit outside any function.
  const bare = found.map((t) => ((ctx[t.at]?.fn ?? '') === '' ? t : null))
  const bareCount = bare.filter(Boolean).length
  if (/^(transition|animation)$/.test(prop)) {
    let times = 0
    bare.forEach((t, i) => {
      if (!t) return
      if (t.kind === 'easing') roles[i] = 'easing'
      else if (t.unit === 's' || t.unit === 'ms') roles[i] = times++ % 2 === 0 ? 'duration' : 'delay'
    })
  } else if (/shadow$/.test(prop)) {
    let n = 0
    bare.forEach((t, i) => {
      if (!t) return
      roles[i] = t.kind === 'color' ? 'colour' : (['x', 'y', 'blur', 'spread'][n++ % 4] ?? '')
    })
  } else if (BOX_PROPS.has(prop) && SIDES[bareCount]) {
    let n = 0
    bare.forEach((t, i) => t && (roles[i] = SIDES[bareCount][n++]))
  } else if (prop === 'gap' && bareCount === 2) {
    let n = 0
    bare.forEach((t, i) => t && (roles[i] = ['row', 'column'][n++]))
  }

  // Disambiguate repeats ("stop", "stop" → "stop 1", "stop 2").
  const totals = new Map<string, number>()
  roles.forEach((r) => totals.set(r, (totals.get(r) ?? 0) + 1))
  const seen = new Map<string, number>()
  return roles.map((r, i) => {
    if (found.length === 1 && !r) return prop
    const role = r || String(i + 1)
    const n = (seen.get(role) ?? 0) + 1
    seen.set(role, n)
    return `${prop} · ${role}${(totals.get(r) ?? 0) > 1 && r ? ` ${n}` : ''}`
  })
}

function pushValueTokens(dials: Dial[], value: string, offset: number, folder: string, prop: string, source: 'css' | 'html') {
  if (SKIP_PROPS.has(prop) || /url\(|data:/.test(value)) return
  const found: Found[] = []
  for (const m of value.matchAll(TOKEN)) {
    const at = m.index!
    const start = offset + at
    const end = start + m[0].length
    if (m[1]) found.push({ at, source, folder, kind: 'color', start, end, raw: m[0], value: m[1], unit: '' })
    else if (m[2]) found.push({ at, source, folder, kind: 'easing', start, end, raw: m[0], value: m[2], unit: '' })
    else {
      const unit = m[4] ?? ''
      // Bare numbers only make sense for a handful of properties (and custom props), but they
      // still occupy a position in shorthands like box-shadow, so name them before dropping.
      const skip = !unit && !UNITLESS_PROPS.has(prop) && !prop.startsWith('--')
      found.push({ at, skip, source, folder, kind: 'number', start, end, raw: m[0], value: parseFloat(m[3]), unit })
    }
  }
  const labels = nameTokens(prop, value, found)
  const kept = found.map((f, i) => ({ f, label: labels[i] })).filter(({ f }) => !f.skip)
  // A lone surviving token is just the property.
  kept.forEach(({ f: { at: _at, skip: _skip, ...d }, label }) => {
    const name = kept.length === 1 && found.length > 1 && !label.includes('·') ? prop : label
    dials.push({ ...d, label: name, key: `${source}|${folder}|${name}` })
  })
}

/** "a, b, c" → "a +2" so long selector lists fit a folder header. */
function folderName(selector: string) {
  const parts = selector.split(',').map((x) => x.trim())
  return parts.length > 1 ? `${parts[0]} +${parts.length - 1}` : parts[0]
}

/**
 * @param js the resource's script — custom properties it writes at runtime are
 *           driven by interaction, so exposing them as dials would do nothing.
 */
export function extractCssDials(css: string, js = ''): Dial[] {
  const dials: Dial[] = []
  // Innermost rule blocks: "selector { declarations }" with no nested braces.
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim().replace(/\s+/g, ' ')
    let folder = folderName(selector)
    if (/^(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+%))*$/.test(selector)) {
      const kf = css.slice(0, rule.index).match(/@keyframes\s+([\w-]+)[^@]*$/)
      folder = `@keyframes ${kf?.[1] ?? ''} · ${selector}`.replace(/\s+·/, ' ·')
    }
    const bodyStart = rule.index! + rule[0].indexOf('{') + 1
    for (const decl of rule[2].matchAll(/([\w-]+)\s*:\s*([^;]+)/g)) {
      const prop = decl[1]
      if (prop.startsWith('--') && js.includes(prop)) continue
      const valueStart = bodyStart + decl.index! + decl[0].indexOf(decl[2], decl[1].length + 1)
      pushValueTokens(dials, decl[2], valueStart, folder, prop, 'css')
    }
  }
  return dedupeKeys(dials)
}

export function extractHtmlDials(html: string): Dial[] {
  const dials: Dial[] = []
  for (const m of html.matchAll(/(data-[\w-]+)="(-?\d*\.?\d+)"/g)) {
    const start = m.index! + m[0].indexOf('"') + 1
    dials.push({ key: '', source: 'html', folder: 'Attributes', label: m[1], kind: 'number', start, end: start + m[2].length, raw: m[2], value: parseFloat(m[2]), unit: '' })
  }
  for (const m of html.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) {
    const start = m.index! + m[0].lastIndexOf(m[2])
    dials.push({ key: '', source: 'html', folder: 'Inline variables', label: m[1], kind: 'color', start, end: start + m[2].length, raw: m[2], value: m[2], unit: '' })
  }
  return dedupeKeys(dials.map((d) => ({ ...d, key: `html|${d.folder}|${d.label}` })))
}

function dedupeKeys(dials: Dial[]) {
  const seen = new Map<string, number>()
  return dials.map((d) => {
    const n = seen.get(d.key) ?? 0
    seen.set(d.key, n + 1)
    return n ? { ...d, key: `${d.key}#${n}`, label: `${d.label} (${n + 1})` } : d
  })
}

/** Slider range inferred from the original value, so it stays stable while dragging. */
export function rangeFor(d: Dial): Range {
  const v = Number(d.value)
  const a = Math.abs(v)
  const prop = d.label.split(' · ')[0].replace(/ \(\d+\)$/, '')
  switch (d.unit) {
    case 'px':
      return { min: v < 0 ? -Math.max(a * 3, 100) : 0, max: Math.max(a * 3, 100), step: 1 }
    case 'rem':
    case 'em':
    case 'ch':
      return { min: v < 0 ? -Math.max(a * 3, 4) : 0, max: Math.max(a * 3, 4), step: 0.05 }
    case 's':
      return { min: 0, max: Math.max(a * 3, 3), step: 0.05 }
    case 'ms':
      return { min: 0, max: Math.max(a * 3, 2000), step: 10 }
    case 'deg':
      return { min: -Math.max(a * 3, 45), max: Math.max(a * 3, 45), step: 1 }
    case '%':
      return { min: v < 0 ? -Math.max(a * 2, 100) : 0, max: Math.max(a * 2, 100), step: 1 }
    case 'vw':
    case 'vh':
    case 'vmax':
    case 'vmin':
      return { min: 0, max: Math.max(a * 2, 100), step: 1 }
    case 'fr':
      return { min: 0, max: Math.max(a * 3, 5), step: 0.1 }
  }
  if (prop === 'opacity') return { min: 0, max: 1, step: 0.01 }
  if (prop === 'font-weight') return { min: 100, max: 900, step: 100 }
  if (prop === 'line-height') return { min: 0.5, max: 3, step: 0.01 }
  const integer = Number.isInteger(v) && a >= 2
  return { min: v < 0 ? -Math.max(a * 3, 1) : 0, max: Math.max(a * 3, 1), step: integer ? 1 : 0.01 }
}

export function formatNumber(n: number, step: number) {
  const decimals = step >= 1 ? 0 : String(step).split('.')[1]?.length ?? 2
  return String(Number(n.toFixed(decimals)))
}

/** Replace the characters a dial controls and return the new source. */
export function applyDial(source: string, d: Dial, next: string) {
  return source.slice(0, d.start) + next + source.slice(d.end)
}
