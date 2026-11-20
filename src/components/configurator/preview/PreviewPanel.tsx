import { useState } from 'react'
import { isBuildType } from '../../../config/products'
import { area, colorHex, type ConfigState } from '../../../lib/configState'
import { fmtNum } from '../../../lib/format'
import { StructurePreview, type PreviewMode } from './StructurePreview'
import { TypeIcon } from '../TypeIcon'
import { getProduct } from '../../../config/products'
import type { Sketch } from '../../../lib/useSketch'
import { SketchEditor } from '../sketch/SketchEditor'
import { SketchCapture } from '../sketch/SketchCapture'

export function toPreviewInput(s: ConfigState) {
  if (!isBuildType(s.type)) return null
  return {
    type: s.type,
    length: s.length,
    width: s.width,
    height: s.height,
    gallery: s.gallery,
    galleryDepth: s.galleryDepth,
    terrace: s.terrace,
    terraceLength: s.terraceLength,
    terraceDepth: s.terraceDepth,
    color: colorHex(s),
  }
}

export function PreviewPanel({ state, sketch, className = '' }: { state: ConfigState; sketch: Sketch; className?: string }) {
  const [mode, setMode] = useState<PreviewMode>('lines')
  const input = toPreviewInput(state)
  const p = getProduct(state.type)
  return (
    <div className={`blueprint relative flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3 p-3 md:p-5">
        <div>
          <p className="eyebrow text-[0.65rem] text-navy/60 md:text-xs">Prikaz</p>
          <p className="display text-base md:text-2xl">{p.shortName}</p>
          {input && <p className="text-sm font-bold tabular-nums text-navy md:text-base">{fmtNum(area(state), 1)} m²</p>}
          {!input && sketch.hasSketch && (
            <p className="text-sm font-bold text-navy md:text-base">
              {sketch.dims.length ? `${sketch.dims.length} ${sketch.dims.length === 1 ? 'kota' : 'kote'}` : 'Povucite liniju da dodate meru'}
            </p>
          )}
        </div>
        {input && (
          <div className="flex border-2 border-navy bg-white text-xs font-bold md:text-sm" role="group" aria-label="Način prikaza">
            {(['lines', 'solid'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`h-8 px-3 md:h-9 md:px-4 ${mode === m ? 'bg-navy text-white' : 'text-navy'}`}
              >
                {m === 'lines' ? 'Linije' : 'Puno'}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative min-h-0 flex-1 px-2 pb-2 md:px-6 md:pb-6">
        {input ? (
          <StructurePreview input={input} mode={mode} className="h-full w-full" title={`Izometrijski prikaz: ${p.name}`} />
        ) : sketch.hasSketch ? (
          sketch.processed ? (
            <SketchEditor sketch={sketch} />
          ) : (
            <p className="flex h-full items-center justify-center font-semibold text-navy" role="status">Obrađujem skicu…</p>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center text-navy">
            <TypeIcon type="skica" className="h-16 w-20 md:h-28 md:w-32" />
            <p className="mt-3 max-w-sm font-semibold md:text-lg">Slikajte svoju skicu. Sajt je pretvara u čist crtež, a Vi dodate mere.</p>
            <div className="mt-5 w-full max-w-md">
              <SketchCapture sketch={sketch} />
            </div>
            {sketch.busy && <p className="mt-3 font-semibold" role="status">Obrađujem skicu…</p>}
            {sketch.error && <p className="mt-3 font-semibold text-red-700" role="alert">{sketch.error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
