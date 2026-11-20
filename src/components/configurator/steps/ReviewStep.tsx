import type { Configurator } from '../../../lib/useConfigurator'
import { StepTitle } from '../ui'
import { Summary } from '../Summary'
import { StructurePreview } from '../preview/StructurePreview'
import { toPreviewInput } from '../preview/PreviewPanel'
import { SketchEditor } from '../sketch/SketchEditor'
import { DRAWING_CONTAINER_ID } from '../../../lib/exportDrawing'

export function ReviewStep({ c, form }: { c: Configurator; form: React.ReactNode }) {
  const input = toPreviewInput(c.state)
  return (
    <div>
      <StepTitle title="Pregled i porudžbina" text="Proverite konstrukciju i ostavite kontakt. Javljamo se da potvrdimo detalje." />
      {input && (
        <div id={DRAWING_CONTAINER_ID} className="blueprint mb-4 border border-line">
          <StructurePreview input={input} animated={false} className="h-auto w-full" title="Snimak Vaše konstrukcije" />
        </div>
      )}
      {!input && c.sketch.hasSketch && (
        <div className="mb-4">
          <div className="blueprint h-72 border border-line p-3 md:h-80">
            <SketchEditor sketch={c.sketch} readOnly />
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            Šaljemo očišćenu skicu{c.sketch.dims.length ? ` sa ${c.sketch.dims.length} ${c.sketch.dims.length === 1 ? 'kotom' : 'kota'}` : ''} i originalnu fotografiju.
          </p>
        </div>
      )}
      <Summary state={c.state} />
      {c.state.note && (
        <div className="mt-4 border border-line bg-white p-4">
          <p className="eyebrow text-[0.68rem] text-ink-soft">Napomena</p>
          <p className="mt-1 whitespace-pre-line">{c.state.note}</p>
        </div>
      )}
      {c.files.length > 0 && (
        <p className="mt-3 text-sm text-ink-soft">Priloženo: {c.files.map((f) => f.name).join(', ')}</p>
      )}
      <div className="mt-8">{form}</div>
    </div>
  )
}
