import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildGeometry, depthOf, project, type V3 } from '../../lib/geometry'
import { prefersReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hero „montaža“: kada crtež prvi put uđe u kadar, konstrukcija se sama iscrta
 * (temelj → stubovi → grede → krovni nosači → paneli). Pre toga se vidi samo bledi nacrt.
 */
const L = 12
const W = 7
const H = 3.4
const S = 46 // px po metru

type Kind = 'ground' | 'post' | 'beam' | 'minor'

export function HeroAssembly({ className = '' }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)

  const { parts, faces, vb } = useMemo(() => {
    const g = buildGeometry({ type: 'kontejnerska', L, W, H, galleryDepth: 0, terraceLength: 0, terraceDepth: 0 })
    const raw = g.lines.map((l) => {
      const vertical = l.a[0] === l.b[0] && l.a[1] === l.b[1]
      const ground = l.a[2] === 0 && l.b[2] === 0
      const kind: Kind = vertical ? 'post' : ground ? 'ground' : l.minor ? 'minor' : 'beam'
      const [a, b] = vertical && l.a[2] > l.b[2] ? [l.b, l.a] : [l.a, l.b]
      return { a, b, kind, depth: a[0] + a[1] + b[0] + b[1] }
    })
    const pts = raw.flatMap((l) => [project(l.a), project(l.b)])
    const minX = Math.min(...pts.map((p) => p[0])) - 0.4
    const minY = Math.min(...pts.map((p) => p[1])) - 0.4
    const maxX = Math.max(...pts.map((p) => p[0])) + 0.4
    const maxY = Math.max(...pts.map((p) => p[1])) + 0.4
    const P = (v: V3) => {
      const [x, y] = project(v)
      return [(x - minX) * S, (y - minY) * S] as const
    }
    const parts = raw
      .sort((p, q) => p.depth - q.depth)
      .map((l) => {
        const [x1, y1] = P(l.a)
        const [x2, y2] = P(l.b)
        return { d: `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`, kind: l.kind }
      })
    const faces = g.faces
      .filter((f) => f.tone > 0.3) // zidovi i krov (bez poda)
      .sort((a, b) => depthOf(a.pts) - depthOf(b.pts))
      .map((f) => ({ points: f.pts.map((p) => P(p).map((n) => n.toFixed(1)).join(',')).join(' '), tone: f.tone }))
    return { parts, faces, vb: `0 0 ${((maxX - minX) * S).toFixed(0)} ${((maxY - minY) * S).toFixed(0)}` }
  }, [])

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el || prefersReducedMotion()) return

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const draw = (sel: string) => {
        const items = q(sel)
        gsap.set(items, { strokeDasharray: 1, strokeDashoffset: 1 })
        return items
      }
      const ground = draw('[data-k="ground"]')
      const posts = draw('[data-k="post"]')
      const beams = q('[data-k="beam"]')
      const minor = q('[data-k="minor"]')
      const panels = q('[data-face]')
      gsap.set(beams, { y: -30, opacity: 0 })
      gsap.set(minor, { y: -16, opacity: 0 })
      gsap.set(panels, { opacity: 0 })

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      tl.to(ground, { strokeDashoffset: 0, duration: 0.8, stagger: 0.04, ease: 'power2.inOut' })
        .to(posts, { strokeDashoffset: 0, duration: 0.55, stagger: 0.05 }, '-=0.2')
        .to(beams, { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: 'back.out(2.2)' }, '-=0.15')
        .to(minor, { y: 0, opacity: 0.75, duration: 0.4, stagger: 0.03 }, '-=0.25')
        .to(panels, { opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power1.out' }, '-=0.1')

      // kreće u trenutku kada se gornja ivica crteža pojavi na ekranu (samo jednom)
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        once: true,
        onEnter: () => tl.play(),
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <svg
        viewBox={vb}
        className="mx-auto block h-auto w-full"
        aria-hidden="true"
        fill="none"
        strokeLinecap="round"
      >
        {/* bledi nacrt pre gradnje */}
        <g stroke="#fff" strokeOpacity={0.1} strokeWidth={1} strokeDasharray="4 6">
          {parts.map((p, i) => (
            <path key={i} d={p.d} />
          ))}
        </g>
        {/* paneli (zatvaranje) */}
        {faces.map((f, i) => (
          <polygon key={i} data-face points={f.points} fill="#fff" fillOpacity={0.05 + f.tone * 0.1} stroke="#fff" strokeOpacity={0.15} />
        ))}
        {parts.map((p, i) => (
          <path
            key={i}
            d={p.d}
            pathLength={1}
            data-k={p.kind}
            stroke="#fff"
            strokeWidth={p.kind === 'minor' ? 1.4 : p.kind === 'ground' ? 2 : 2.8}
            strokeOpacity={p.kind === 'minor' ? 0.7 : 0.95}
          />
        ))}
      </svg>
    </div>
  )
}
