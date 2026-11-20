import { pricing } from '../config/pricing'
import { DEFAULT_COLOR_ID } from '../config/options'
import { isBuildType } from '../config/products'
import { area, type ConfigState } from './configState'

/** Okvirna cena ili null kada je showPrice=false / cena nije moguća (skica) */
export function estimatePrice(s: ConfigState): number | null {
  if (!pricing.showPrice || !isBuildType(s.type)) return null
  const a = area(s)
  let total = a * pricing.perM2[s.type] + a * pricing.joiningPerM2[s.joining]
  if (s.colorId !== DEFAULT_COLOR_ID) total += pricing.customColorFlat
  if (s.gallery) {
    // površina galerije ≈ dubina × širina poda na visini galerije (oko pola osnove kod A-frame)
    total += s.galleryDepth * s.width * 0.5 * pricing.galleryPerM2
  }
  if (s.terrace) total += s.terraceLength * s.terraceDepth * pricing.terracePerM2
  if (s.assembly) total += a * pricing.assemblyPerM2
  return Math.round(total)
}

export const PRICE_ON_REQUEST = 'Cenu potvrđujemo u razgovoru, javljamo se u roku od 24h'
