/**
 * Parametarska geometrija konstrukcija za izometrijski SVG prikaz.
 * Koordinate: x = dužina, y = širina (y = W je „prednja“ strana prema posmatraču), z = visina. Jedinica: metar.
 */
import type { BuildType } from '../config/products'

export type V3 = [number, number, number]
export interface Line { a: V3; b: V3; minor?: boolean; layer?: 'gallery' | 'terrace' }
export interface Face { pts: V3[]; tone: number; layer?: 'gallery' | 'terrace' }
export interface Dim { a: V3; b: V3; dir: V3; value: number; key: string }
export interface Geometry { lines: Line[]; faces: Face[]; dims: Dim[]; human: V3 }

export interface GeoParams {
  type: BuildType
  L: number
  W: number
  H: number
  galleryDepth: number // 0 = nema
  terraceLength: number
  terraceDepth: number // 0 = nema
}

const C = Math.cos(Math.PI / 6)
export const project = ([x, y, z]: V3): [number, number] => [(x - y) * C, (x + y) * 0.5 - z]

function divisions(len: number, approx: number): number[] {
  const n = Math.max(1, Math.round(len / approx))
  return Array.from({ length: n + 1 }, (_, i) => (len * i) / n)
}

const DIM_OFF = 1.1

function box(lines: Line[], faces: Face[], L: number, W: number, Hb: number, Hf: number) {
  // Hb = visina zadnje strane (y=0), Hf = prednje (y=W)
  const xs = divisions(L, 3)
  // dno
  lines.push({ a: [0, 0, 0], b: [L, 0, 0] }, { a: [0, W, 0], b: [L, W, 0] })
  // vrh
  lines.push({ a: [0, 0, Hb], b: [L, 0, Hb] }, { a: [0, W, Hf], b: [L, W, Hf] })
  for (const x of xs) {
    const end = x === 0 || x === L
    lines.push({ a: [x, 0, 0], b: [x, 0, Hb] }, { a: [x, W, 0], b: [x, W, Hf] })
    lines.push({ a: [x, 0, Hb], b: [x, W, Hf], minor: !end })
    lines.push({ a: [x, 0, 0], b: [x, W, 0], minor: !end })
  }
  // stubovi i rožnjače po širini, ako je široko
  const ys = divisions(W, 3).slice(1, -1)
  for (const y of ys) {
    const h = Hb + ((Hf - Hb) * y) / W
    lines.push({ a: [0, y, 0], b: [0, y, h] }, { a: [L, y, 0], b: [L, y, h] })
    lines.push({ a: [0, y, h], b: [L, y, h], minor: true })
  }
  // dijagonalna ukrućenja u krajnjim poljima zadnjeg zida
  if (xs.length > 1) {
    lines.push({ a: [0, 0, 0], b: [xs[1], 0, Hb], minor: true })
    lines.push({ a: [L, 0, 0], b: [xs[xs.length - 2], 0, Hb], minor: true })
  }
  faces.push(
    { pts: [[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0]], tone: 0.2 },
    { pts: [[0, 0, 0], [L, 0, 0], [L, 0, Hb], [0, 0, Hb]], tone: 0.55 },
    { pts: [[0, 0, 0], [0, W, 0], [0, W, Hf], [0, 0, Hb]], tone: 0.75 },
    { pts: [[L, 0, 0], [L, W, 0], [L, W, Hf], [L, 0, Hb]], tone: 0.75 },
    { pts: [[0, W, 0], [L, W, 0], [L, W, Hf], [0, W, Hf]], tone: 0.55 },
    { pts: [[0, 0, Hb], [L, 0, Hb], [L, W, Hf], [0, W, Hf]], tone: 0.35 },
  )
}

function aframe(lines: Line[], faces: Face[], L: number, W: number, H: number, gd: number) {
  const m = W / 2
  const xs = divisions(L, 1.2)
  for (const x of xs) {
    const end = x === 0 || x === L
    lines.push({ a: [x, 0, 0], b: [x, m, H], minor: !end }, { a: [x, m, H], b: [x, W, 0], minor: !end })
    lines.push({ a: [x, 0, 0], b: [x, W, 0], minor: true })
  }
  lines.push({ a: [0, 0, 0], b: [L, 0, 0] }, { a: [0, W, 0], b: [L, W, 0] }, { a: [0, m, H], b: [L, m, H] })
  // rožnjače na kosinama
  for (const t of [1 / 3, 2 / 3]) {
    const z = H * t
    const off = m * t
    lines.push({ a: [0, off, z], b: [L, off, z], minor: true }, { a: [0, W - off, z], b: [L, W - off, z], minor: true })
  }
  // zatege na čelima
  const zt = H * 0.55
  const ht = m * (1 - zt / H)
  lines.push({ a: [0, m - ht, zt], b: [0, m + ht, zt], minor: true }, { a: [L, m - ht, zt], b: [L, m + ht, zt], minor: true })

  faces.push(
    { pts: [[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0]], tone: 0.2 },
    { pts: [[0, 0, 0], [L, 0, 0], [L, m, H], [0, m, H]], tone: 0.4 },
    { pts: [[0, 0, 0], [0, W, 0], [0, m, H]], tone: 0.75 },
    { pts: [[L, 0, 0], [L, W, 0], [L, m, H]], tone: 0.8 },
    { pts: [[0, W, 0], [L, W, 0], [L, m, H], [0, m, H]], tone: 0.55 },
  )

  if (gd > 0.05) {
    const zg = Math.min(H * 0.5, 2.6)
    const hw = m * (1 - zg / H)
    const x0 = L - gd
    const g: Line[] = [
      { a: [x0, m - hw, zg], b: [L, m - hw, zg] },
      { a: [x0, m + hw, zg], b: [L, m + hw, zg] },
      { a: [x0, m - hw, zg], b: [x0, m + hw, zg] },
    ]
    for (const x of xs) if (x > x0 + 0.1) g.push({ a: [x, m - hw, zg], b: [x, m + hw, zg], minor: true })
    const zr = zg + 0.9
    if (zr < H - 0.3) {
      const hr = m * (1 - zr / H)
      g.push({ a: [x0, m - hr, zr], b: [x0, m + hr, zr], minor: true })
      for (const y of [m - hr, m, m + hr]) g.push({ a: [x0, y, zg], b: [x0, y, zr], minor: true })
    }
    g.forEach((l) => lines.push({ ...l, layer: 'gallery' }))
    faces.push({ pts: [[x0, m - hw, zg], [L, m - hw, zg], [L, m + hw, zg], [x0, m + hw, zg]], tone: 0.3, layer: 'gallery' })
  }
}

function terrace(lines: Line[], faces: Face[], x0: number, y0: number, lx: number, ly: number, outer: 'x' | 'y') {
  const z = 0.25
  const x1 = x0 + lx
  const y1 = y0 + ly
  const t: Line[] = [
    { a: [x0, y0, z], b: [x1, y0, z] },
    { a: [x1, y0, z], b: [x1, y1, z] },
    { a: [x1, y1, z], b: [x0, y1, z] },
    { a: [x0, y1, z], b: [x0, y0, z] },
  ]
  // grede poda
  if (outer === 'y') for (const x of divisions(lx, 1)) t.push({ a: [x0 + x, y0, z], b: [x0 + x, y1, z], minor: true })
  else for (const y of divisions(ly, 1)) t.push({ a: [x0, y0 + y, z], b: [x1, y0 + y, z], minor: true })
  // ograda na spoljnim ivicama
  const r = z + 1
  const rail: [V3, V3][] =
    outer === 'y'
      ? [[[x0, y1, r], [x1, y1, r]], [[x1, y0, r], [x1, y1, r]], [[x0, y0, r], [x0, y1, r]]]
      : [[[x1, y0, r], [x1, y1, r]], [[x0, y0, r], [x1, y0, r]], [[x0, y1, r], [x1, y1, r]]]
  rail.forEach(([a, b]) => t.push({ a, b, minor: true }))
  const posts: V3[] =
    outer === 'y'
      ? [...divisions(lx, 2).map((x) => [x0 + x, y1, z] as V3), [x1, y0, z], [x0, y0, z]]
      : [...divisions(ly, 2).map((y) => [x1, y0 + y, z] as V3), [x0, y0, z], [x0, y1, z]]
  posts.forEach((p) => t.push({ a: p, b: [p[0], p[1], r], minor: true }))
  // stubovi ispod
  ;[[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([x, y]) => t.push({ a: [x, y, 0], b: [x, y, z], minor: true }))
  t.forEach((l) => lines.push({ ...l, layer: 'terrace' }))
  faces.push({ pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], tone: 0.25, layer: 'terrace' })
}

export function buildGeometry(p: GeoParams): Geometry {
  const { type, L, W, H } = p
  const lines: Line[] = []
  const faces: Face[] = []
  const td = p.terraceDepth
  const tl = p.terraceLength
  let hx = 0 // dodatni prostor desno (x) zbog terase
  let hy = 0 // dodatni prostor napred (y)

  if (type === 'aframe') {
    aframe(lines, faces, L, W, H, p.galleryDepth)
    if (td > 0.05) {
      terrace(lines, faces, L, W / 2 - tl / 2, td, tl, 'x')
      hx = td
    }
  } else {
    box(lines, faces, L, W, H, H)
    if (td > 0.05) {
      terrace(lines, faces, 0, W, tl, td, 'y')
      hy = td
    }
  }

  const yFront = Math.max(W, type === 'aframe' ? W / 2 + tl / 2 : W) + hy
  const xRight = Math.max(L + hx, type !== 'aframe' && td > 0.05 ? tl : 0)
  const hy0 = type === 'aframe' ? W / 2 : W
  const dims: Dim[] = [
    { key: 'L', a: [0, yFront + DIM_OFF, 0], b: [L, yFront + DIM_OFF, 0], dir: [0, 1, 0], value: L },
    { key: 'W', a: [xRight + DIM_OFF, 0, 0], b: [xRight + DIM_OFF, W, 0], dir: [1, 0, 0], value: W },
    { key: 'H', a: [-DIM_OFF * 0.8, hy0, 0], b: [-DIM_OFF * 0.8, hy0, H], dir: [-1, 0, 0], value: H },
  ]
  const human: V3 = [xRight + 1.7, yFront + 1.7, 0]
  return { lines, faces, dims, human }
}

/** dubina za sortiranje lica (veće = bliže posmatraču) */
export const depthOf = (pts: V3[]) => pts.reduce((s, [x, y, z]) => s + x + y + z * 0.5, 0) / pts.length
