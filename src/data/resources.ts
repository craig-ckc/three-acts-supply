/** GSAP core plus its (free since 3.13) plugins; each loads from cdnjs in the preview. */
export type Lib = 'gsap' | 'ScrollTrigger' | 'Flip' | 'SplitText' | 'Draggable' | 'Observer' | 'CustomEase' | 'InertiaPlugin'

export interface Resource {
  slug: string
  title: string
  category: Category
  description: string
  tags: string[]
  addedDaysAgo: number
  free?: boolean
  libs?: Lib[]
  /** Pre-recorded gallery media; resource code only runs in the full preview. */
  preview?: {
    video: string
    poster: string
  }
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

/*
 * Each resource lives in src/resources/<slug>/ as plain files — the same
 * shape a database row would have (meta + html/css/js text fields):
 *   meta.json   title, category, description, tags, addedDaysAgo, free?, libs?
 *   index.html  markup
 *   style.css   styles
 *   script.js   optional behaviour
 */
type Meta = Omit<Resource, 'slug' | 'html' | 'css' | 'js'>

const metas = import.meta.glob<Meta>('../resources/*/meta.json', { eager: true, import: 'default' })
const sources = import.meta.glob<string>('../resources/*/*.{html,css,js}', { eager: true, query: '?raw', import: 'default' })

const file = (slug: string, name: string) => sources[`../resources/${slug}/${name}`] ?? ''

export const resources: Resource[] = Object.entries(metas)
  .map(([path, meta]) => {
    const slug = path.split('/')[2]
    return { ...meta, slug, html: file(slug, 'index.html'), css: file(slug, 'style.css'), js: file(slug, 'script.js') }
  })
  .filter((r) => (categories as readonly string[]).includes(r.category))
  .sort((a, b) => a.addedDaysAgo - b.addedDaysAgo || a.title.localeCompare(b.title))

export const getResource = (slug: string) => resources.find((r) => r.slug === slug)
