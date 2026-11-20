import type { ConfigState } from './configState'
import { initialState, sanitize } from './configState'
import type { ProductType } from '../config/products'

const TYPES: ProductType[] = ['aframe', 'kontejnerska', 'skica']
const LS_KEY = 'mk-konfigurator-v1'

const num = (v: string | null) => (v == null || v === '' || isNaN(Number(v)) ? undefined : Number(v))
const bool = (v: string | null) => (v == null ? undefined : v === '1')

/** Konfiguracija -> query string (napomena se ne stavlja u URL) */
export function toQuery(s: ConfigState): string {
  const q = new URLSearchParams()
  q.set('tip', s.type)
  if (s.type !== 'skica') {
    if (s.presetId) q.set('preset', s.presetId)
    q.set('d', String(s.length))
    q.set('s', String(s.width))
    q.set('v', String(s.height))
    q.set('sp', s.joining)
    q.set('boja', s.colorId)
    if (s.customRal) q.set('ral', s.customRal)
    if (s.gallery) q.set('gal', String(s.galleryDepth))
    if (s.terrace) q.set('ter', `${s.terraceLength}x${s.terraceDepth}`)
  }
  q.set('pr', s.transport ? '1' : '0')
  q.set('mo', s.assembly ? '1' : '0')
  if (s.purpose) q.set('nam', s.purpose)
  return q.toString()
}

/** Čita konfiguraciju iz URL-a; vraća null ako nema `tip` */
export function fromQuery(search: string, base?: ConfigState): ConfigState | null {
  const q = new URLSearchParams(search)
  const tip = q.get('tip') as ProductType | null
  if (!tip || !TYPES.includes(tip)) return null
  const s: ConfigState = base && base.type === tip ? { ...base } : initialState(tip)
  const onlyType = [...q.keys()].length === 1
  if (onlyType) return sanitize(s)
  s.presetId = q.get('preset')
  s.length = num(q.get('d')) ?? s.length
  s.width = num(q.get('s')) ?? s.width
  s.height = num(q.get('v')) ?? s.height
  const sp = q.get('sp')
  if (sp === 'sraf' || sp === 'var') s.joining = sp
  s.colorId = q.get('boja') ?? s.colorId
  s.customRal = q.get('ral') ?? ''
  const gal = num(q.get('gal'))
  s.gallery = gal != null
  if (gal != null) s.galleryDepth = gal
  const ter = q.get('ter')
  s.terrace = !!ter
  if (ter) {
    const [a, b] = ter.split('x').map(Number)
    if (!isNaN(a)) s.terraceLength = a
    if (!isNaN(b)) s.terraceDepth = b
  }
  s.transport = bool(q.get('pr')) ?? s.transport
  s.assembly = bool(q.get('mo')) ?? s.assembly
  s.purpose = (q.get('nam') as ConfigState['purpose']) ?? ''
  return sanitize(s)
}

export interface Persisted {
  state: ConfigState
  step: number
  maxStep: number
}

export function loadLocal(): Persisted | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Persisted
    // stari sačuvani tip koji više ne postoji (npr. krov na jednu vodu) -> kreni ispočetka
    if (!p?.state?.type || !TYPES.includes(p.state.type)) return null
    return { ...p, state: sanitize({ ...initialState(p.state.type), ...p.state }) }
  } catch {
    return null
  }
}

export function saveLocal(p: Persisted) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p))
  } catch {
    /* privatni režim ili pun storage – nije kritično */
  }
}

export function clearLocal() {
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    /* ignore */
  }
}
