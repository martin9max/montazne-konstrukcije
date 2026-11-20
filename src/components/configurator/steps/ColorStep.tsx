import { colorNote, colorOptions, CUSTOM_COLOR_ID } from '../../../config/options'
import type { Configurator } from '../../../lib/useConfigurator'
import { StepTitle } from '../ui'
import { CheckIcon } from '../../ui/Icons'

export function ColorStep({ c }: { c: Configurator }) {
  const s = c.state
  const custom = s.colorId === CUSTOM_COLOR_ID
  return (
    <fieldset>
      <legend className="sr-only">Boja</legend>
      <StepTitle title="Boja" text={`${colorNote} Podrazumevana je crna.`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {colorOptions.map((col) => {
          const sel = s.colorId === col.id
          return (
            <label
              key={col.id}
              className={`relative flex cursor-pointer flex-col border-2 bg-white transition-colors ${sel ? 'border-navy' : 'border-line hover:border-navy/40'}`}
            >
              <input type="radio" name="boja" className="sr-only" checked={sel} onChange={() => c.update({ colorId: col.id })} />
              <span className="block h-16 border-b border-line" style={{ background: col.hex }} aria-hidden="true" />
              <span className="p-3">
                <span className="block font-bold">{col.name}</span>
                {col.ral && <span className="text-sm text-ink-soft">{col.ral}</span>}
              </span>
              {sel && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center bg-navy text-white" aria-hidden="true">
                  <CheckIcon className="h-4 w-4" />
                </span>
              )}
            </label>
          )
        })}
        <label
          className={`relative flex cursor-pointer flex-col border-2 bg-white transition-colors ${custom ? 'border-navy' : 'border-line hover:border-navy/40'}`}
        >
          <input type="radio" name="boja" className="sr-only" checked={custom} onChange={() => c.update({ colorId: CUSTOM_COLOR_ID })} />
          <span
            className="block h-16 border-b border-line"
            style={{ background: 'repeating-linear-gradient(90deg,#8a2d2d 0 25%,#2f5a3a 25% 50%,#2b4a7a 50% 75%,#b08a2e 75% 100%)' }}
            aria-hidden="true"
          />
          <span className="p-3">
            <span className="block font-bold">Druga boja</span>
            <span className="text-sm text-ink-soft">po RAL karti</span>
          </span>
        </label>
      </div>
      {custom && (
        <div className="mt-5">
          <label htmlFor="ral" className="label">
            Koja boja? (RAL oznaka ili opis)
          </label>
          <input
            id="ral"
            className="field"
            placeholder="npr. RAL 6005 zelena"
            value={s.customRal}
            maxLength={60}
            onChange={(e) => c.update({ customRal: e.target.value })}
            aria-invalid={!!c.stepError}
          />
        </div>
      )}
    </fieldset>
  )
}
