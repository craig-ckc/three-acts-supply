import { strToU8, zipSync } from 'fflate'

export interface SourceFiles {
  html: string
  css: string
  js: string
}

const NAMES: Record<keyof SourceFiles, string> = { html: 'index.html', css: 'style.css', js: 'script.js' }
const TYPES: Record<keyof SourceFiles, string> = { html: 'text/html', css: 'text/css', js: 'text/javascript' }

/** Only the fields that actually have content become files. */
export function presentFiles(code: SourceFiles) {
  return (Object.keys(NAMES) as (keyof SourceFiles)[]).filter((k) => code[k].trim()).map((k) => ({ key: k, name: NAMES[k] }))
}

function save(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

/** One file downloads as itself; several are zipped under the resource slug. */
export function downloadSource(slug: string, code: SourceFiles) {
  const files = presentFiles(code)
  if (files.length === 0) return
  if (files.length === 1) {
    const { key, name } = files[0]
    return save(new Blob([code[key]], { type: TYPES[key] }), name)
  }
  const zip = zipSync(Object.fromEntries(files.map(({ key, name }) => [`${slug}/${name}`, strToU8(code[key])])))
  save(new Blob([zip], { type: 'application/zip' }), `${slug}.zip`)
}
