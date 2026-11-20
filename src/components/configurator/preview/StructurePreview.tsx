import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { buildGeometry, depthOf, project, type Dim, type V3 } from '../../../lib/geometry'
import { useTween } from '../../../lib/useTween'
import type { BuildType } from '../../../config/products'

export type PreviewMode = 'lines' | 'solid'

export interface PreviewInput {
  type: BuildType
  length: number
  width: number
  height: number
  gallery: boolean
  galleryDepth: number
  terrace: boolean
  terraceLength: number
  terraceDepth: number
  color: string
}

const VB_W = 800
const VB_H = 600
const PAD = 44

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export const StructurePreview = memo(function StructurePreview({
  input,
  mode = 'lines',
  animated = true,
  className = '',
  title,
}: {
  input: PreviewInput
  mode?: PreviewMode
  animated?: boolean
  className?: string
  title?: string
}) {
  const t = useTween(
    {
      L: input.length,
      W: input.width,
      H: input.height,
      gd: input.gallery ? input.galleryDepth : 0,
      gOn: input.gallery ? 1 : 0,
      tl: input.terraceLength,
      td: input.terrace ? input.terraceDepth : 0,
      tOn: input.terrace ? 1 : 0,
      solid: mode === 'solid' ? 1 : 0,
    },
    animated,
  )

  const geo = useMemo(
    () =>
      buildGeometry({
        type: input.type,
        L: t.L,
        W: t.W,
        H: t.H,
        galleryDepth: t.gd,
        terraceLength: t.tl,
        terraceDepth: t.td,
      }),
    [input.type, t.L, t.W, t.H, t.gd, t.tl, t.td],
  )

  // uklapanje u okvir
  const { s, ox, oy } = useMemo(() => {
    const pts: [number, number][] = []
    geo.lines.forEach((l) => pts.push(project(l.a), project(l.b)))
    geo.dims.forEach((d) => pts.push(project(d.a), project(d.b)))
    pts.push(project(geo.human), project([geo.human[0], geo.human[1], 1.8]))
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const [x, y] of pts) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    }
    const s = Math.min((VB_W - PAD * 2) / (maxX - minX), (VB_H - PAD * 2) / (maxY - minY))
    const ox = (VB_W - (maxX - minX) * s) / 2 - minX * s
    const oy = (VB_H - (maxY - minY) * s) / 2 - minY * s
    return { s, ox, oy }
  }, [geo])

  const P = (v: V3) => {
    const [x, y] = project(v)
    return [x * s + ox, y * s + oy] as const
  }
  const seg = (a: V3, b: V3) => {
    const [x1, y1] = P(a)
    const [x2, y2] = P(b)
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`
  }

  const color = input.color
  const light = luminance(color) > 0.55
  const opacityFor = (layer?: 'gallery' | 'terrace') => (layer === 'gallery' ? t.gOn : layer === 'terrace' ? t.tOn : 1)

  const groups = useMemo(() => {
    const by: Record<string, string[]> = {}
    for (const l of geo.lines) {
      const k = `${l.layer ?? 'base'}|${l.minor ? 'minor' : 'main'}`
      ;(by[k] ??= []).push(seg(l.a, l.b))
    }
    return Object.entries(by).map(([k, d]) => {
      const [layer, w] = k.split('|')
      return { layer: layer === 'base' ? undefined : (layer as 'gallery' | 'terrace'), minor: w === 'minor', d: d.join('') }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, s, ox, oy])

  const faces = useMemo(
    () => (t.solid > 0.01 ? [...geo.faces].sort((a, b) => depthOf(a.pts) - depthOf(b.pts)) : []),
    [geo, t.solid],
  )

  // oznake i linije ostaju čitljive i kada je crtež mali (mobilni)
  const svgRef = useRef<SVGSVGElement>(null)
  const [k, setK] = useState(1)
  useEffect(() => {
    const el = svgRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      const shown = Math.min(r.width / VB_W, r.height / VB_H)
      setK(Math.min(2.6, Math.max(1, 0.75 / shown)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const lk = Math.sqrt(k)
  const mainW = 2.6 * lk
  const minorW = 1.5 * lk

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className={className}
      role="img"
      aria-label={title ?? 'Prikaz konstrukcije'}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <marker id="dim-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M0 1 L10 5 L0 9 z" fill="#14243F" />
        </marker>
      </defs>

      {/* senka */}
      <g opacity={0.5 * (1 - t.solid) + 0.2}>
        {geo.faces.slice(0, 1).map((f, i) => (
          <polygon key={i} points={f.pts.map((p) => P(p).join(',')).join(' ')} fill="#14243F" fillOpacity={0.06} />
        ))}
      </g>

      {/* površine (režim „Puno“) */}
      {faces.map((f, i) => (
        <polygon
          key={i}
          points={f.pts.map((p) => P(p).join(',')).join(' ')}
          fill={`rgb(${Math.round(200 + f.tone * 45)} ${Math.round(203 + f.tone * 42)} ${Math.round(207 + f.tone * 38)})`}
          fillOpacity={0.82 * t.solid * opacityFor(f.layer)}
          stroke="none"
        />
      ))}

      {/* podloga za svetle boje da se ramovi vide na svetloj pozadini */}
      {light &&
        groups.map((g, i) => (
          <path
            key={`u${i}`}
            d={g.d}
            stroke="#14243F"
            strokeOpacity={0.45 * opacityFor(g.layer)}
            strokeWidth={(g.minor ? minorW : mainW) + 2}
            fill="none"
            strokeLinecap="round"
          />
        ))}

      <g style={{ stroke: color, transition: 'stroke .45s ease' }} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {groups.map((g, i) => (
          <path
            key={i}
            d={g.d}
            strokeWidth={g.minor ? minorW : mainW}
            strokeOpacity={(g.minor ? 0.75 : 1) * opacityFor(g.layer)}
          />
        ))}
      </g>

      {/* čovek za razmeru (1,8 m) */}
      <Human P={P} at={geo.human} k={k} />

      {/* kote */}
      {geo.dims.map((d) => (
        <DimAnnotation key={d.key} d={d} P={P} k={k} />
      ))}
    </svg>
  )
})

function Human({ P, at, k }: { P: (v: V3) => readonly [number, number]; at: V3; k: number }) {
  const [fx, fy] = P(at)
  const [, hy] = P([at[0], at[1], 1.8])
  const h = fy - hy
  const u = h / 1.8
  const head = 0.12 * u
  return (
    <g stroke="#14243F" strokeOpacity={0.55} strokeWidth={1.4} fill="none" strokeLinecap="round" aria-hidden="true">
      <circle cx={fx} cy={hy + head} r={head} />
      <path d={`M${fx} ${hy + head * 2} V${fy - 0.85 * u} M${fx} ${fy - 0.85 * u} L${fx - 0.18 * u} ${fy} M${fx} ${fy - 0.85 * u} L${fx + 0.18 * u} ${fy} M${fx - 0.25 * u} ${fy - 1.35 * u} L${fx} ${hy + head * 2.6} L${fx + 0.25 * u} ${fy - 1.35 * u}`} />
      <text x={fx} y={fy + 16 * k} textAnchor="middle" fontSize={11 * k} fill="#14243F" fillOpacity={0.55} stroke="none" fontFamily="Manrope, sans-serif">
        1,8 m
      </text>
    </g>
  )
}

function DimAnnotation({ d, P, k }: { d: Dim; P: (v: V3) => readonly [number, number]; k: number }) {
  const [x1, y1] = P(d.a)
  const [x2, y2] = P(d.b)
  // pomoćne (produžne) linije prema konstrukciji
  const back = (v: V3): V3 => [v[0] - d.dir[0] * 0.9, v[1] - d.dir[1] * 0.9, v[2] - d.dir[2] * 0.9]
  const [ex1, ey1] = P(back(d.a))
  const [ex2, ey2] = P(back(d.b))
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const label = `${d.value.toLocaleString('sr-Latn-RS', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m`
  const w = (label.length * 9.6 + 16) * k
  return (
    <g>
      <path
        d={`M${ex1} ${ey1}L${x1} ${y1}M${ex2} ${ey2}L${x2} ${y2}`}
        stroke="#14243F"
        strokeOpacity={0.35}
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#14243F" strokeWidth={1.3 * Math.sqrt(k)} markerStart="url(#dim-arrow)" markerEnd="url(#dim-arrow)" />
      <rect x={mx - w / 2} y={my - 14 * k} width={w} height={28 * k} fill="#14243F" />
      <text
        x={mx}
        y={my + 5.5 * k}
        textAnchor="middle"
        fontSize={16 * k}
        fontWeight="700"
        fill="#fff"
        fontFamily="Manrope, sans-serif"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {label}
      </text>
    </g>
  )
}
