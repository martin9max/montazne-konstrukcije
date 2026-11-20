/**
 * Skica kupca: fotografija sa papira -> čist crtež (u pregledaču, bez spoljnog servisa)
 * + kote koje kupac sam dodaje.
 */
export interface SketchDim {
  id: string
  /** koordinate su normalizovane (0..1) u odnosu na sliku */
  x1: number
  y1: number
  x2: number
  y2: number
  value: string
}

export interface SketchSource {
  dataUrl: string
  w: number
  h: number
}

export const SKETCH_MAX_PX = 1400
export const SKETCH_DEFAULT_THRESHOLD = 0.86
export const SKETCH_INK = [20, 36, 63] as const // teget
export const DIM_COLOR = '#C2410C'

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Pregledač ne podržava obradu slike.')
  return { c, ctx }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Slika ne može da se učita.'))
    img.src = src
  })
}

/** Fotografija -> umanjen JPEG sa ispravnom orijentacijom */
export async function prepareSource(file: File): Promise<SketchSource> {
  let src: CanvasImageSource
  let w: number
  let h: number
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
    src = bmp
    w = bmp.width
    h = bmp.height
  } catch {
    const url = URL.createObjectURL(file)
    try {
      const img = await loadImage(url)
      src = img
      w = img.naturalWidth
      h = img.naturalHeight
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }
  const k = Math.min(1, SKETCH_MAX_PX / Math.max(w, h))
  const W = Math.round(w * k)
  const H = Math.round(h * k)
  const { c, ctx } = canvas(W, H)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, W, H)
  return { dataUrl: c.toDataURL('image/jpeg', 0.85), w: W, h: H }
}

/** Okretanje za 90° u smeru kazaljke */
export async function rotateSource(s: SketchSource): Promise<SketchSource> {
  const img = await loadImage(s.dataUrl)
  const { c, ctx } = canvas(s.h, s.w)
  ctx.translate(s.h, 0)
  ctx.rotate(Math.PI / 2)
  ctx.drawImage(img, 0, 0)
  return { dataUrl: c.toDataURL('image/jpeg', 0.85), w: s.h, h: s.w }
}

export const rotateDim = (d: SketchDim): SketchDim => ({ ...d, x1: 1 - d.y1, y1: d.x1, x2: 1 - d.y2, y2: d.x2 })

/**
 * Čišćenje: procena pozadine (papir, senke) mutnim umanjenjem, deljenje sa pozadinom,
 * prag i uklanjanje sitnih tačkica. Rezultat je teget linija na providnoj pozadini (PNG).
 */
export async function processSketch(src: string, threshold: number): Promise<string> {
  const img = await loadImage(src)
  const w = img.naturalWidth
  const h = img.naturalHeight
  const { c, ctx } = canvas(w, h)
  ctx.drawImage(img, 0, 0)
  const px = ctx.getImageData(0, 0, w, h)

  // pozadina: postepeno umanjivanje (glatko) pa nazad na punu veličinu
  let cur: HTMLCanvasElement = c
  let cw = w
  let ch = h
  const target = Math.max(w, h) / 40
  while (Math.max(cw, ch) / 2 > target) {
    const nw = Math.max(2, Math.round(cw / 2))
    const nh = Math.max(2, Math.round(ch / 2))
    const step = canvas(nw, nh)
    step.ctx.imageSmoothingQuality = 'high'
    step.ctx.drawImage(cur, 0, 0, nw, nh)
    cur = step.c
    cw = nw
    ch = nh
  }
  const bg = canvas(w, h)
  bg.ctx.imageSmoothingQuality = 'high'
  bg.ctx.drawImage(cur, 0, 0, w, h)
  const bgPx = bg.ctx.getImageData(0, 0, w, h).data

  const d = px.data
  const n = w * h
  const alpha = new Float32Array(n)
  const soft = 0.1
  for (let i = 0; i < n; i++) {
    const o = i * 4
    const g = 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2]
    const b = 0.299 * bgPx[o] + 0.587 * bgPx[o + 1] + 0.114 * bgPx[o + 2]
    const r = g / (b + 1)
    const a = (threshold - r) / soft
    alpha[i] = a <= 0 ? 0 : a >= 1 ? 1 : a
  }

  // uklanjanje izolovanih tačkica
  const out = ctx.createImageData(w, h)
  const od = out.data
  const [R, G, B] = SKETCH_INK
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      let a = alpha[i]
      if (a > 0) {
        let nb = 0
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy
          if (yy < 0 || yy >= h) continue
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx
            if ((dx || dy) && xx >= 0 && xx < w && alpha[yy * w + xx] > 0.35) nb++
          }
        }
        if (nb < 2) a = 0
      }
      const o = i * 4
      od[o] = R
      od[o + 1] = G
      od[o + 2] = B
      od[o + 3] = Math.round(a * 255)
    }
  }
  ctx.putImageData(out, 0, 0)
  return c.toDataURL('image/png')
}

/** Geometrija kote u pikselima (zajednička za SVG i izvoz) */
export function dimShape(x1: number, y1: number, x2: number, y2: number, s: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const t = 9 * s // pola dužine zareza
  const al = 14 * s // dužina strelice
  const aw = 5 * s
  const arrow = (px: number, py: number, dir: 1 | -1) =>
    [
      [px, py],
      [px - dir * ux * al + nx * aw, py - dir * uy * al + ny * aw],
      [px - dir * ux * al - nx * aw, py - dir * uy * al - ny * aw],
    ] as [number, number][]
  return {
    ticks: [
      [x1 - nx * t, y1 - ny * t, x1 + nx * t, y1 + ny * t],
      [x2 - nx * t, y2 - ny * t, x2 + nx * t, y2 + ny * t],
    ],
    arrows: [arrow(x1, y1, -1), arrow(x2, y2, 1)],
    mid: [(x1 + x2) / 2, (y1 + y2) / 2] as [number, number],
  }
}

export const dimLabel = (v: string) => `${v.trim() ? v.trim().replace('.', ',') : '?'} m`

/** Konačna slika za slanje: čist crtež na mreži + kote */
export async function composeSketch(processed: string, w: number, h: number, dims: SketchDim[]): Promise<Blob> {
  const img = await loadImage(processed)
  const s = Math.max(1, w / 700)
  const footer = Math.round(44 * s)
  const { c, ctx } = canvas(w, h + footer)
  ctx.fillStyle = '#F6F5F2'
  ctx.fillRect(0, 0, w, h + footer)
  ctx.strokeStyle = 'rgba(20,36,63,0.07)'
  ctx.lineWidth = 1
  const grid = Math.round(w / 24)
  for (let x = grid; x < w; x += grid) {
    ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke()
  }
  for (let y = grid; y < h; y += grid) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke()
  }
  ctx.drawImage(img, 0, 0)

  for (const d of dims) {
    const x1 = d.x1 * w, y1 = d.y1 * h, x2 = d.x2 * w, y2 = d.y2 * h
    const sh = dimShape(x1, y1, x2, y2, s)
    ctx.strokeStyle = DIM_COLOR
    ctx.fillStyle = DIM_COLOR
    ctx.lineWidth = 2.2 * s
    ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    for (const [a, b, cx, cy] of sh.ticks) {
      ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(cx, cy); ctx.stroke()
    }
    for (const poly of sh.arrows) {
      ctx.beginPath()
      poly.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
      ctx.closePath(); ctx.fill()
    }
    const label = dimLabel(d.value)
    ctx.font = `700 ${Math.round(17 * s)}px Manrope, Arial, sans-serif`
    const tw = ctx.measureText(label).width + 16 * s
    const th = 28 * s
    ctx.fillRect(sh.mid[0] - tw / 2, sh.mid[1] - th / 2, tw, th)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, sh.mid[0], sh.mid[1] + 1)
  }

  ctx.fillStyle = '#14243F'
  ctx.fillRect(0, h, w, footer)
  ctx.fillStyle = '#fff'
  ctx.font = `700 ${Math.round(15 * s)}px Manrope, Arial, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('SKICA KUPCA  •  MONTAŽNE KONSTRUKCIJE', 16 * s, h + footer / 2)

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('Izvoz skice nije uspeo.'))), 'image/jpeg', 0.88))
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], name, { type: blob.type })
}
