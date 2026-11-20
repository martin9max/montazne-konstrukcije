import type { Sketch } from '../../../lib/useSketch'
import { dimLabel } from '../../../lib/sketch'
import { SketchCapture } from './SketchCapture'
import { CloseIcon } from '../../ui/Icons'

/** Kontrole skice u koraku „Skica i napomena“ */
export function SketchControls({ sketch }: { sketch: Sketch }) {
  if (!sketch.hasSketch) {
    return (
      <div className="border-2 border-navy bg-white p-5">
        <h3 className="text-lg font-bold">Slikajte skicu telefonom</h3>
        <p className="mt-1 text-ink-soft">Sajt od fotografije napravi čist crtež, a Vi na njega dodate mere.</p>
        <ul className="mt-3 space-y-1 text-[0.95rem] text-ink-soft">
          <li>– papir stavite na ravnu podlogu</li>
          <li>– slikajte odozgo, pri dobrom svetlu</li>
          <li>– crtajte olovkom ili hemijskom, što tamnije</li>
        </ul>
        <div className="mt-5">
          <SketchCapture sketch={sketch} />
        </div>
        {sketch.busy && <p className="mt-3 font-semibold text-navy" role="status">Obrađujem skicu…</p>}
        {sketch.error && <p className="mt-3 font-semibold text-red-700" role="alert">{sketch.error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="border-2 border-navy bg-white p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-bold">Vaša skica</h3>
          {sketch.busy && <span className="text-sm font-semibold text-navy" role="status">Obrađujem…</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <SketchCapture sketch={sketch} compact />
          <button type="button" onClick={sketch.rotate} className="btn btn-outline-dark h-11 min-h-11 bg-white px-4 text-sm">
            Okreni 90°
          </button>
          <button
            type="button"
            onClick={() => window.confirm('Ukloniti skicu i sve kote?') && sketch.clear()}
            className="btn h-11 min-h-11 px-3 text-sm text-ink-soft underline underline-offset-4 hover:text-red-700"
          >
            Ukloni
          </button>
        </div>
        <div className="mt-4">
          <label htmlFor="skica-prag" className="font-bold">
            Jačina linija
          </label>
          <input
            id="skica-prag"
            type="range"
            className="range"
            min={0.7}
            max={0.97}
            step={0.01}
            value={sketch.threshold}
            onChange={(e) => sketch.setThreshold(Number(e.target.value))}
            aria-valuetext={`${Math.round(((sketch.threshold - 0.7) / 0.27) * 100)} posto`}
          />
          <p className="flex justify-between text-xs text-ink-soft">
            <span>manje šuma</span>
            <span>više detalja</span>
          </p>
        </div>
        {sketch.error && <p className="mt-3 font-semibold text-red-700" role="alert">{sketch.error}</p>}
      </div>

      <div>
        <h3 className="text-lg font-bold">Mere (kote)</h3>
        <p className="mt-1 text-ink-soft">
          <span className="lg:hidden">Na skici gore</span>
          <span className="hidden lg:inline">Na skici levo</span> povucite prstom ili mišem od jedne do druge tačke, pa upišite meru.
        </p>
        {sketch.dims.length > 0 ? (
          <ol className="mt-3 space-y-2">
            {sketch.dims.map((d, i) => (
              <li
                key={d.id}
                className={`flex items-center gap-3 border-2 bg-white px-3 py-2 ${sketch.selected === d.id ? 'border-navy' : 'border-line'}`}
              >
                <button type="button" onClick={() => sketch.setSelected(d.id)} className="flex-1 text-left font-semibold">
                  Kota {i + 1}
                  {!d.value.trim() && <span className="ml-2 text-sm font-semibold text-red-700">upišite meru</span>}
                </button>
                <label htmlFor={`lista-kota-${d.id}`} className="sr-only">
                  Mera kote {i + 1}
                </label>
                <input
                  id={`lista-kota-${d.id}`}
                  inputMode="decimal"
                  placeholder="?"
                  className="h-10 w-20 border border-line px-2 text-right font-bold tabular-nums outline-none focus:border-navy"
                  value={d.value}
                  maxLength={8}
                  onChange={(e) => sketch.updateDim(d.id, { value: e.target.value.replace(/[^\d.,]/g, '') })}
                  aria-invalid={!d.value.trim()}
                />
                <span className="font-bold text-ink-soft">m</span>
                <button type="button" onClick={() => sketch.removeDim(d.id)} className="flex h-10 w-10 items-center justify-center text-ink-soft hover:text-red-700" aria-label={`Obriši kotu ${i + 1} (${dimLabel(d.value)})`}>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 border border-dashed border-navy/30 p-3 text-sm text-ink-soft">Još nema kota. Mere nisu obavezne, ali nam mnogo pomažu.</p>
        )}
      </div>
    </div>
  )
}
