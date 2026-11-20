import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DIM_COLOR, dimLabel, dimShape, type SketchDim } from '../../../lib/sketch'
import type { Sketch } from '../../../lib/useSketch'
import { CloseIcon } from '../../ui/Icons'

type Drag = { kind: 'new'; d: SketchDim } | { kind: 'end'; id: string; which: 1 | 2 } | null

const MIN_LEN_PX = 28

/**
 * Prikaz očišćene skice sa kotama. Kupac povuče prstom/mišem od tačke do tačke i upiše meru.
 */
export function SketchEditor({ sketch, readOnly = false }: { sketch: Sketch; readOnly?: boolean }) {
  const { source, processed, dims, selected, setSelected } = sketch
  const wrap = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [drag, setDrag] = useState<Drag>(null)

  // uklapanje slike u raspoloživ prostor uz očuvanje proporcije
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el || !source) return
    const fit = () => {
      const r = el.getBoundingClientRect()
      const k = Math.min(r.width / source.w, r.height / source.h)
      setBox({ w: Math.floor(source.w * k), h: Math.floor(source.h * k) })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [source])

  useEffect(() => {
    if (readOnly) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [readOnly, setSelected])

  if (!source) return null
  const W = source.w
  const H = source.h
  const k = box.w ? W / box.w : 1 // jedinica slike po pikselu ekrana

  const pos = (e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }
  }

  const onDown = (e: React.PointerEvent) => {
    if (readOnly || e.button > 0) return
    const p = pos(e)
    svg.current!.setPointerCapture(e.pointerId)
    setSelected(null)
    setDrag({ kind: 'new', d: { id: `k${Date.now().toString(36)}`, x1: p.x, y1: p.y, x2: p.x, y2: p.y, value: '' } })
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return
    const p = pos(e)
    if (drag.kind === 'new') setDrag({ kind: 'new', d: { ...drag.d, x2: p.x, y2: p.y } })
    else sketch.updateDim(drag.id, drag.which === 1 ? { x1: p.x, y1: p.y } : { x2: p.x, y2: p.y })
  }
  const onUp = () => {
    if (drag?.kind === 'new') {
      const d = drag.d
      const len = Math.hypot((d.x2 - d.x1) * box.w, (d.y2 - d.y1) * box.h)
      if (len >= MIN_LEN_PX) {
        sketch.addDim(d)
        setSelected(d.id)
      }
    }
    setDrag(null)
  }

  const all = drag?.kind === 'new' ? [...dims, drag.d] : dims
  const sel = dims.find((d) => d.id === selected)

  return (
    <div ref={wrap} className="relative flex h-full w-full items-center justify-center">
      {box.w > 0 && (
        <div className="relative" style={{ width: box.w, height: box.h }}>
          <svg
            ref={svg}
            viewBox={`0 0 ${W} ${H}`}
            width={box.w}
            height={box.h}
            className={`block bg-white/60 shadow-[0_1px_0_rgb(20_36_63/.15),0_0_0_1px_rgb(20_36_63/.12)] ${readOnly ? '' : 'cursor-crosshair touch-none select-none'}`}
            role="img"
            aria-label={`Vaša skica${dims.length ? `, kote: ${dims.map((d) => dimLabel(d.value)).join(', ')}` : ''}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => setDrag(null)}
          >
            {processed && <image href={processed} x="0" y="0" width={W} height={H} />}
            {all.map((d) => {
              const x1 = d.x1 * W, y1 = d.y1 * H, x2 = d.x2 * W, y2 = d.y2 * H
              const sh = dimShape(x1, y1, x2, y2, k)
              const label = dimLabel(d.value)
              const lw = (label.length * 9 + 16) * k
              const isSel = d.id === selected
              return (
                <g
                  key={d.id}
                  onPointerDown={(e) => {
                    if (readOnly) return
                    e.stopPropagation()
                    setSelected(d.id)
                  }}
                  className={readOnly ? '' : 'cursor-pointer'}
                >
                  {/* šira nevidljiva linija da se lakše pogodi prstom */}
                  {!readOnly && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={22 * k} />}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM_COLOR} strokeWidth={(isSel ? 3 : 2.2) * k} strokeLinecap="round" />
                  {sh.ticks.map(([a, b, c, e], i) => (
                    <line key={i} x1={a} y1={b} x2={c} y2={e} stroke={DIM_COLOR} strokeWidth={2.2 * k} strokeLinecap="round" />
                  ))}
                  {sh.arrows.map((poly, i) => (
                    <polygon key={i} points={poly.map((p) => p.join(',')).join(' ')} fill={DIM_COLOR} />
                  ))}
                  <rect x={sh.mid[0] - lw / 2} y={sh.mid[1] - 14 * k} width={lw} height={28 * k} fill={isSel ? '#14243F' : DIM_COLOR} />
                  <text x={sh.mid[0]} y={sh.mid[1] + 5.5 * k} textAnchor="middle" fontSize={16 * k} fontWeight={700} fill="#fff" fontFamily="Manrope, sans-serif">
                    {label}
                  </text>
                </g>
              )
            })}
            {/* ručke za pomeranje krajeva izabrane kote */}
            {!readOnly &&
              sel &&
              ([1, 2] as const).map((which) => (
                <circle
                  key={which}
                  cx={(which === 1 ? sel.x1 : sel.x2) * W}
                  cy={(which === 1 ? sel.y1 : sel.y2) * H}
                  r={11 * k}
                  fill="#fff"
                  stroke="#14243F"
                  strokeWidth={3 * k}
                  className="cursor-move"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    svg.current!.setPointerCapture(e.pointerId)
                    setDrag({ kind: 'end', id: sel.id, which })
                  }}
                />
              ))}
          </svg>

          {/* polje za upis mere izabrane kote */}
          {!readOnly && sel && !drag && (
            <DimValueEditor
              key={sel.id}
              dim={sel}
              left={Math.min(Math.max(((sel.x1 + sel.x2) / 2) * box.w, 110), box.w - 110)}
              top={((sel.y1 + sel.y2) / 2) * box.h}
              boxH={box.h}
              onChange={(v) => sketch.updateDim(sel.id, { value: v })}
              onDelete={() => sketch.removeDim(sel.id)}
              onDone={() => setSelected(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function DimValueEditor({
  dim,
  left,
  top,
  boxH,
  onChange,
  onDelete,
  onDone,
}: {
  dim: SketchDim
  left: number
  top: number
  boxH: number
  onChange: (v: string) => void
  onDelete: () => void
  onDone: () => void
}) {
  const below = top < boxH - 90
  return (
    <div
      className="absolute z-10 flex items-center gap-1 border-2 border-navy bg-white p-1 shadow-[0_8px_24px_-8px_rgb(12_22_40/.5)]"
      style={{ left, top: below ? top + 22 : top - 22, transform: `translate(-50%, ${below ? '0' : '-100%'})` }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <label className="sr-only" htmlFor={`kota-${dim.id}`}>
        Mera kote u metrima
      </label>
      <input
        id={`kota-${dim.id}`}
        autoFocus
        inputMode="decimal"
        placeholder="npr. 6,5"
        className="h-10 w-20 border border-line px-2 text-right text-base font-bold tabular-nums outline-none focus:border-navy"
        value={dim.value}
        maxLength={8}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
        onKeyDown={(e) => e.key === 'Enter' && onDone()}
      />
      <span className="px-1 font-bold text-ink-soft">m</span>
      <button type="button" onClick={onDone} className="h-10 bg-navy px-3 text-sm font-bold text-white">
        OK
      </button>
      <button type="button" onClick={onDelete} className="flex h-10 w-10 items-center justify-center text-ink-soft hover:text-red-700" aria-label="Obriši kotu">
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
