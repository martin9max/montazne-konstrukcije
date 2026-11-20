import { extrasByType, extrasLimits } from '../../../config/options'
import type { Configurator } from '../../../lib/useConfigurator'
import { DimInput, StepTitle, Toggle } from '../ui'

export function ExtrasStep({ c }: { c: Configurator }) {
  const s = c.state
  const ex = extrasByType[s.type]
  return (
    <div>
      <StepTitle title="Dodaci" text="Uključite ono što Vam treba." />
      <div className="space-y-3">
        {ex.gallery && (
          <Toggle
            checked={s.gallery}
            onChange={(v) => c.update({ gallery: v })}
            title="Galerija"
            text="Sprat u potkrovlju, za spavaći deo ili ostavu."
          >
            <DimInput
              label="Dubina galerije"
              value={s.galleryDepth}
              min={extrasLimits.galleryDepth.min}
              max={Math.min(extrasLimits.galleryDepth.max, s.length)}
              onChange={(v) => c.update({ galleryDepth: v })}
            />
          </Toggle>
        )}
        {ex.terrace && (
          <Toggle
            checked={s.terrace}
            onChange={(v) => c.update({ terrace: v })}
            title="Terasa"
            text={s.type === 'aframe' ? 'Ispred ulaza (čeone strane).' : 'Uz dužu stranu objekta.'}
          >
            <div className="space-y-4">
              <DimInput
                label="Dužina terase"
                value={s.terraceLength}
                min={extrasLimits.terraceLength.min}
                max={extrasLimits.terraceLength.max}
                onChange={(v) => c.update({ terraceLength: v })}
              />
              <DimInput
                label="Dubina terase"
                value={s.terraceDepth}
                min={extrasLimits.terraceDepth.min}
                max={extrasLimits.terraceDepth.max}
                onChange={(v) => c.update({ terraceDepth: v })}
              />
            </div>
          </Toggle>
        )}
        <Toggle checked={s.transport} onChange={(v) => c.update({ transport: v })} title="Prevoz" text="Dovozimo konstrukciju do Vaše lokacije." />
        <Toggle checked={s.assembly} onChange={(v) => c.update({ assembly: v })} title="Montaža na lokaciji" text="Naši ljudi montiraju konstrukciju kod Vas." />
      </div>
    </div>
  )
}
