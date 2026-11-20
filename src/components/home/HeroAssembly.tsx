import { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildGeometry, depthOf, project, type V3 } from '../../lib/geometry'
import { prefersReducedMotion } from '../../lib/motion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Hero „montaža na skrol“: kada korisnik dođe do konstrukcije, kadar se zaustavi
 * i konstrukcija se gradi kako se skroluje (temelj → stubovi → grede → krovni nosači → zatvaranje).
 * Skrol unazad vraća gradnju. Pre početka se vidi samo bledi nacrt.
 */
const L = 12
const W = 7
const H = 3.4
const S = 46 // px po metru

type Kind = 'ground' | 'post' | 'beam' | 'minor'

const STAGES = [
  { label: 'Temelj', text: 'Donji ram se postavlja na betonske stope ili ploču.' },
  { label: 'Stubovi', text: 'Stubovi se spajaju šrafovima ili zavaruju.' },
  { label: 'Grede', text: 'Gornji ram povezuje stubove u čvrstu celinu.' },
  { label: 'Krovni nosači', text: 'Nosači za krov, ofarbani bojom 3u1.' },
  { label: 'Zatvaranje', text: 'Vi zatvarate panelima, drvetom ili limom.' },
]

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
    if (!el) return
    const stageEls = el.querySelectorAll<HTMLElement>('[data-stage]')
    const bar = el.querySelector<HTMLElement>('[data-progress]')
    const pct = el.querySelector<HTMLElement>('[data-pct]')
    const caption = el.querySelector<HTMLElement>('[data-caption]')

    const setStage = (p: number) => {
      const i = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length * 0.999))
      stageEls.forEach((s, k) => {
        s.dataset.state = k < i ? 'done' : k === i ? 'active' : 'todo'
      })
      if (caption) caption.textContent = STAGES[i].text
      if (bar) bar.style.transform = `scaleX(${p})`
      if (pct) pct.textContent = `${Math.round(p * 100)}%`
    }

    if (prefersReducedMotion()) {
      setStage(1)
      return
    }

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

      // svaka faza traje 1 jedinicu → lako mapiranje na nazive faza
      const tl = gsap.timeline({ defaults: { ease: 'none' } })
      tl.to(ground, { strokeDashoffset: 0, duration: 1, stagger: { amount: 0.6 } }, 0)
        .to(posts, { strokeDashoffset: 0, duration: 0.5, stagger: { amount: 0.5 } }, 1)
        .to(beams, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)', stagger: { amount: 0.55 } }, 2)
        .to(minor, { y: 0, opacity: 0.75, duration: 0.4, stagger: { amount: 0.6 } }, 3)
        .to(panels, { opacity: 1, duration: 0.5, stagger: { amount: 0.5 } }, 4)
        .to({}, { duration: 0.001 }, 5)

      const mobile = window.innerWidth < 768
      ScrollTrigger.create({
        trigger: el,
        // desktop: dno bloka malo iznad dna ekrana; telefon: centrirano ispod headera (dole je dugme „Pozovi“)
        start: () => {
          if (window.innerWidth >= 768) return `bottom ${window.innerHeight - 28}px`
          const header = document.querySelector('header')?.getBoundingClientRect().height ?? 72
          return `center ${Math.round((window.innerHeight + header) / 2)}px`
        },
        invalidateOnRefresh: true,
        end: mobile ? '+=110%' : '+=140%',
        pin: true,
        pinSpacing: true, // roditelj je flex, pa mora eksplicitno
        scrub: 0.6,
        animation: tl,
        onUpdate: (self) => setStage(self.progress),
      })
      setStage(0)
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrap} className={`relative ${className}`}>
      {/* visina crteža je ograničena tako da ceo blok (crtež + faze) stane ispod headera */}
      <svg
        viewBox={vb}
        className="mx-auto block h-auto w-full max-h-[calc(100svh-16rem)] sm:max-h-[calc(100svh-16.5rem)]"
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

      {/* faze gradnje */}
      <div className="mx-auto mt-5 max-w-3xl">
        <div className="flex items-center gap-4">
          <div className="relative h-[3px] flex-1 bg-white/15">
            <div data-progress className="absolute inset-0 origin-left bg-white" style={{ transform: 'scaleX(0)' }} />
          </div>
          <span data-pct className="w-12 text-right font-mono text-sm tabular-nums text-white/70">
            0%
          </span>
        </div>
        <ol className="mt-4 hidden grid-cols-5 gap-2 sm:grid">
          {STAGES.map((s, i) => (
            <li
              key={s.label}
              data-stage
              data-state={i === 0 ? 'active' : 'todo'}
              className="border-t-2 border-white/15 pt-2 text-left text-xs font-bold uppercase tracking-[0.14em] text-white/35 transition-colors duration-300 data-[state=active]:border-white data-[state=active]:text-white data-[state=done]:border-white/60 data-[state=done]:text-white/70"
            >
              <span className="mr-1.5 font-mono text-white/40">{String(i + 1).padStart(2, '0')}</span>
              {s.label}
            </li>
          ))}
        </ol>
        <p data-caption className="mt-4 min-h-[1.5em] text-center text-base text-white/80 md:text-lg" aria-live="off">
          {STAGES[0].text}
        </p>
      </div>
    </div>
  )
}
