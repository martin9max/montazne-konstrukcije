import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './motion'

gsap.registerPlugin(ScrollTrigger)

/** Otkrivanje sekcija na scroll ([data-reveal]) i „razvlačenje“ kota (.dimline) */
export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((node) => {
        gsap.from(node, {
          y: 28,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 88%', once: true },
        })
      })
      gsap.utils.toArray<HTMLElement>('.dimline').forEach((node) => {
        gsap.from(node, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.1,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: node, start: 'top 92%', once: true },
        })
      })
    }, el)
    const t = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => {
      clearTimeout(t)
      ctx.revert()
    }
  }, [root])
}
