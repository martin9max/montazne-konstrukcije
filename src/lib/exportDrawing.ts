/**
 * Pretvara crtež konstrukcije (isti SVG koji kupac vidi na kraju konfiguratora)
 * u JPEG za porudžbinu: mreža, crtež sa kotama i traka sa sažetkom.
 */
import { getProduct, isBuildType } from '../config/products'
import { joiningOptions } from '../config/options'
import { area, colorLabel, dimsLabel, extrasList, type ConfigState } from './configState'
import { fmtNum } from './format'

export const DRAWING_CONTAINER_ID = 'snimak-konstrukcije'

const W = 1600
const H = 1200

function loadSvg(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(W))
  clone.setAttribute('height', String(H))
  clone.removeAttribute('class')
  const xml = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }))
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Crtež ne može da se pretvori u sliku.'))
    }
    img.src = url
  })
}

export async function exportDrawing(state: ConfigState): Promise<File | null> {
  if (!isBuildType(state.type)) return null
  const svg = document.querySelector<SVGSVGElement>(`#${DRAWING_CONTAINER_ID} svg`)
  if (!svg) return null
  const img = await loadSvg(svg)

  const footer = 150
  const c = document.createElement('canvas')
  c.width = W
  c.height = H + footer
  const ctx = c.getContext('2d')
  if (!ctx) return null

  // podloga sa mrežom kao na sajtu
  ctx.fillStyle = '#EEECE7'
  ctx.fillRect(0, 0, W, H)
  for (const [step, alpha] of [[20, 0.035], [100, 0.07]] as const) {
    ctx.strokeStyle = `rgba(20,36,63,${alpha})`
    ctx.lineWidth = 1
    for (let x = step; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke()
    }
    for (let y = step; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke()
    }
  }
  ctx.drawImage(img, 0, 0, W, H)

  // traka sa sažetkom
  const p = getProduct(state.type)
  const joining = joiningOptions.find((j) => j.id === state.joining)?.name ?? ''
  const extras = extrasList(state)
  ctx.fillStyle = '#14243F'
  ctx.fillRect(0, H, W, footer)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'alphabetic'
  ctx.font = '800 34px Manrope, Arial, sans-serif'
  ctx.fillText(`${p.name.toUpperCase()}  ·  ${dimsLabel(state)}  ·  ${fmtNum(area(state), 1)} m²`, 40, H + 56)
  ctx.font = '500 26px Manrope, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText(`${joining}  ·  ${colorLabel(state)}${extras.length ? '  ·  ' + extras.join(', ') : ''}`, 40, H + 98, W - 80)
  ctx.font = '700 20px Manrope, Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText('KONFIGURACIJA KUPCA  •  MONTAŽNE KONSTRUKCIJE  •  BORANJAC', 40, H + 132)

  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.9))
  return blob ? new File([blob], 'konstrukcija-crtez.jpg', { type: 'image/jpeg' }) : null
}
