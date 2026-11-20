import { prefersReducedMotion } from './motion'

/** Skrol do sekcije (nativni skrol pregledača, bez biblioteke) */
export function scrollToTarget(target: string | number | HTMLElement, offset = -80) {
  const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth'
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'auto' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (el) window.scrollTo({ top: (el as HTMLElement).getBoundingClientRect().top + window.scrollY + offset, behavior })
}
