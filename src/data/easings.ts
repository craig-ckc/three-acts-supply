export type Curve = [number, number, number, number]

export const easings: { name: string; curve: Curve; gsap: string }[] = [
  { name: 'Linear', curve: [0, 0, 1, 1], gsap: 'none' },
  { name: 'Quad Out', curve: [0.5, 1, 0.89, 1], gsap: 'power1.out' },
  { name: 'Cubic Out', curve: [0.33, 1, 0.68, 1], gsap: 'power2.out' },
  { name: 'Quart Out', curve: [0.25, 1, 0.5, 1], gsap: 'power3.out' },
  { name: 'Expo Out', curve: [0.16, 1, 0.3, 1], gsap: 'expo.out' },
  { name: 'Circ Out', curve: [0, 0.55, 0.45, 1], gsap: 'circ.out' },
  { name: 'Back Out', curve: [0.34, 1.56, 0.64, 1], gsap: 'back.out(1.7)' },
  { name: 'Smooth Out', curve: [0.22, 1, 0.36, 1], gsap: 'power4.out' },
  { name: 'Cubic In-Out', curve: [0.65, 0, 0.35, 1], gsap: 'power2.inOut' },
  { name: 'Quart In-Out', curve: [0.76, 0, 0.24, 1], gsap: 'power3.inOut' },
  { name: 'Expo In-Out', curve: [0.87, 0, 0.13, 1], gsap: 'expo.inOut' },
  { name: 'Cubic In', curve: [0.32, 0, 0.67, 0], gsap: 'power2.in' },
  { name: 'Expo In', curve: [0.7, 0, 0.84, 0], gsap: 'expo.in' },
  { name: 'Back In', curve: [0.36, 0, 0.66, -0.56], gsap: 'back.in(1.7)' },
]

export const bezier = (c: Curve) => `cubic-bezier(${c.join(', ')})`

export function parseBezier(s: string): Curve | null {
  const m = s.match(/cubic-bezier\(([^)]*)\)/)
  if (!m) return null
  const n = m[1].split(',').map((x) => parseFloat(x))
  return n.length === 4 && n.every((x) => !isNaN(x)) ? (n as Curve) : null
}
