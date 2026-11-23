/**
 * Validacija – koristi se i na klijentu i na serveru (api/order.ts).
 */
import { getProduct, isBuildType, type ProductType } from '../config/products'

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-/().]/g, '')
}

/** Srpski broj: 06x…, 0xx…, +381…, 00381… */
export function isValidSerbianPhone(raw: string): boolean {
  return /^(?:\+381|00381|0)[1-9]\d{7,8}$/.test(normalizePhone(raw))
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim())
}

export interface ContactData {
  name: string
  phone: string
  email: string
  address: string
  preferredDate: string
  consent: boolean
}

export type ContactErrors = Partial<Record<keyof ContactData, string>>

export function validateContact(c: ContactData): ContactErrors {
  const e: ContactErrors = {}
  if (c.name.trim().length < 2) e.name = 'Upišite ime.'
  if (!c.phone.trim()) e.phone = 'Upišite broj telefona.'
  else if (!isValidSerbianPhone(c.phone)) e.phone = 'Broj nije ispravan. Primer: 065 123 4567'
  if (c.email.trim() && !isValidEmail(c.email)) e.email = 'Email adresa nije ispravna.'
  return e
}

/** Provera dimenzija u granicama konfiga; vraća poruku ili null */
export function validateDims(type: ProductType, length: number, width: number, height: number): string | null {
  if (!isBuildType(type)) return null
  const p = getProduct(type)
  if (!p.limits) return null
  const checks: [number, { min: number; max: number }, string][] = [
    [length, p.limits.length, p.labels.length],
    [width, p.limits.width, p.labels.width],
    [height, p.limits.height, p.labels.height],
  ]
  for (const [v, r, label] of checks) {
    if (typeof v !== 'number' || isNaN(v) || v < r.min || v > r.max) {
      return `${label} mora biti između ${String(r.min).replace('.', ',')} i ${String(r.max).replace('.', ',')} m.`
    }
  }
  return null
}
