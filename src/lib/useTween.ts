import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from './motion'

const ease = (t: number) => 1 - Math.pow(1 - t, 3)

/** Glatko interpolira objekat brojeva prema ciljnim vrednostima (requestAnimationFrame) */
export function useTween<T extends Record<string, number>>(target: T, enabled = true, duration = 0.55): T {
  const [cur, setCur] = useState<T>(target)
  const curRef = useRef<T>(target)
  const key = JSON.stringify(target)

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      curRef.current = target
      setCur(target)
      return
    }
    const from = { ...curRef.current }
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = ease(Math.min(1, (now - start) / (duration * 1000)))
      const next = {} as Record<string, number>
      for (const k of Object.keys(target)) {
        const a = from[k] ?? target[k]
        next[k] = a + (target[k] - a) * p
      }
      curRef.current = next as T
      setCur(next as T)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return cur
}
