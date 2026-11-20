import { getProduct, isBuildType, leadTime, type ProductType } from '../config/products'
import {
  colorOptions,
  CUSTOM_COLOR_ID,
  CUSTOM_COLOR_PREVIEW_HEX,
  DEFAULT_COLOR_ID,
  extrasByType,
  extrasLimits,
  joiningOptions,
  purposes,
  type Joining,
  type PurposeId,
} from '../config/options'
import { clamp, fmtM, fmtNum, round1 } from './format'

export interface ConfigState {
  type: ProductType
  presetId: string | null // null = po meri
  length: number
  width: number
  height: number
  joining: Joining
  colorId: string
  customRal: string
  gallery: boolean
  galleryDepth: number
  terrace: boolean
  terraceLength: number
  terraceDepth: number
  transport: boolean
  assembly: boolean
  purpose: PurposeId | ''
  note: string
}

export function defaultsForType(type: ProductType): Pick<ConfigState, 'presetId' | 'length' | 'width' | 'height'> {
  const p = getProduct(type)
  const preset = p.presets[0]
  if (preset) return { presetId: preset.id, length: preset.length, width: preset.width, height: preset.height }
  return { presetId: null, length: 6, width: 3, height: 2.5 }
}

export function initialState(type: ProductType = 'aframe'): ConfigState {
  const d = defaultsForType(type)
  return {
    type,
    ...d,
    joining: 'sraf',
    colorId: DEFAULT_COLOR_ID,
    customRal: '',
    gallery: false,
    galleryDepth: Math.min(4, round1(d.length * 0.6)),
    terrace: false,
    terraceLength: d.length,
    terraceDepth: 3,
    transport: true,
    assembly: true,
    purpose: '',
    note: '',
  }
}

/** Promena tipa: nove dimenzije i ugašeni dodaci koji ne postoje za taj tip */
export function changeType(s: ConfigState, type: ProductType): ConfigState {
  if (s.type === type) return s
  const d = defaultsForType(type)
  const ex = extrasByType[type]
  return {
    ...s,
    type,
    ...d,
    gallery: ex.gallery ? s.gallery : false,
    galleryDepth: Math.min(s.galleryDepth, d.length),
    terrace: ex.terrace ? s.terrace : false,
    terraceLength: type === 'aframe' ? d.width : d.length,
  }
}

/** Dovodi stanje u granice konfiga (koristi se i za podatke iz URL-a / localStorage) */
export function sanitize(s: ConfigState): ConfigState {
  const p = getProduct(s.type)
  const out = { ...s }
  if (p.limits) {
    out.length = round1(clamp(out.length, p.limits.length.min, p.limits.length.max))
    out.width = round1(clamp(out.width, p.limits.width.min, p.limits.width.max))
    out.height = round1(clamp(out.height, p.limits.height.min, p.limits.height.max))
  }
  if (out.presetId && !p.presets.some((x) => x.id === out.presetId)) out.presetId = null
  if (!joiningOptions.some((j) => j.id === out.joining)) out.joining = 'sraf'
  if (out.colorId !== CUSTOM_COLOR_ID && !colorOptions.some((c) => c.id === out.colorId)) out.colorId = DEFAULT_COLOR_ID
  const ex = extrasByType[s.type]
  if (!ex.gallery) out.gallery = false
  if (!ex.terrace) out.terrace = false
  out.galleryDepth = round1(clamp(out.galleryDepth, extrasLimits.galleryDepth.min, Math.min(extrasLimits.galleryDepth.max, out.length)))
  out.terraceLength = round1(clamp(out.terraceLength, extrasLimits.terraceLength.min, extrasLimits.terraceLength.max))
  out.terraceDepth = round1(clamp(out.terraceDepth, extrasLimits.terraceDepth.min, extrasLimits.terraceDepth.max))
  if (out.purpose && !purposes.some((x) => x.id === out.purpose)) out.purpose = ''
  out.customRal = String(out.customRal ?? '').slice(0, 60)
  out.note = String(out.note ?? '').slice(0, 2000)
  return out
}

export const area = (s: Pick<ConfigState, 'length' | 'width'>) => round1(s.length * s.width)

export function colorHex(s: ConfigState): string {
  if (s.colorId === CUSTOM_COLOR_ID) return CUSTOM_COLOR_PREVIEW_HEX
  return colorOptions.find((c) => c.id === s.colorId)?.hex ?? colorOptions[0].hex
}

export function colorLabel(s: ConfigState): string {
  if (s.colorId === CUSTOM_COLOR_ID) return `Druga boja: ${s.customRal.trim() || 'po dogovoru'}`
  const c = colorOptions.find((x) => x.id === s.colorId)
  return c ? `${c.name}${c.ral ? ` (${c.ral})` : ''}` : ''
}

export function dimsLabel(s: ConfigState): string {
  if (!isBuildType(s.type)) return 'Po skici'
  return `${fmtNum(s.length, 1)} × ${fmtNum(s.width, 1)} m, visina ${fmtM(s.height)}`
}

export function extrasList(s: ConfigState): string[] {
  const out: string[] = []
  if (s.gallery) out.push(`Galerija dubine ${fmtM(s.galleryDepth)}`)
  if (s.terrace) out.push(`Terasa ${fmtNum(s.terraceLength, 1)} × ${fmtNum(s.terraceDepth, 1)} m`)
  if (s.transport) out.push('Prevoz')
  if (s.assembly) out.push('Montaža na lokaciji')
  return out
}

export function leadTimeFor(s: ConfigState): string {
  if (!isBuildType(s.type)) return `${leadTime.standard} (zavisi od skice)`
  return area(s) > leadTime.largeAreaThreshold ? leadTime.large : leadTime.standard
}

export function purposeLabel(s: ConfigState): string {
  return purposes.find((p) => p.id === s.purpose)?.name ?? ''
}

/** Čitljiv sažetak u redovima (za sažetak, potvrdu i poruku vlasniku) */
export function summaryRows(s: ConfigState): { label: string; value: string }[] {
  const p = getProduct(s.type)
  const rows = [{ label: 'Tip', value: p.name }]
  if (isBuildType(s.type)) {
    rows.push({ label: 'Dimenzije', value: dimsLabel(s) })
    rows.push({ label: 'Površina', value: `${fmtNum(area(s), 1)} m²` })
    rows.push({ label: 'Spajanje', value: joiningOptions.find((j) => j.id === s.joining)?.name ?? '' })
    rows.push({ label: 'Boja', value: colorLabel(s) })
  }
  const ex = extrasList(s)
  rows.push({ label: 'Dodaci', value: ex.length ? ex.join(', ') : 'Bez dodataka' })
  if (s.purpose) rows.push({ label: 'Namena', value: purposeLabel(s) })
  rows.push({ label: 'Okvirni rok', value: leadTimeFor(s) })
  return rows
}
