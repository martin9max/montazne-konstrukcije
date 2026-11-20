import { purposes } from '../../../config/options'
import type { Configurator } from '../../../lib/useConfigurator'
import { Chip, StepTitle } from '../ui'
import { FileUpload } from '../FileUpload'
import { SketchControls } from '../sketch/SketchControls'

export function PurposeStep({ c }: { c: Configurator }) {
  const s = c.state
  const sketch = s.type === 'skica'
  return (
    <div>
      <StepTitle
        title={sketch ? 'Skica i napomena' : 'Namena i napomena'}
        text={sketch ? 'Slikajte skicu, dodajte mere i napišite šta Vam treba.' : 'Nije obavezno, ali nam pomaže da Vam bolje predložimo rešenje.'}
      />
      {sketch && (
        <div className="mb-8">
          <SketchControls sketch={c.sketch} />
        </div>
      )}
      <p className="label">Za šta će služiti?</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Namena">
        {purposes.map((p) => (
          <Chip key={p.id} active={s.purpose === p.id} onClick={() => c.update({ purpose: s.purpose === p.id ? '' : p.id })}>
            {p.name}
          </Chip>
        ))}
      </div>
      <div className="mt-6">
        <label htmlFor="napomena" className="label">
          Napomena
        </label>
        <textarea
          id="napomena"
          className="field min-h-32"
          rows={4}
          maxLength={2000}
          placeholder={sketch ? 'npr. treba mi konstrukcija 7×4 m, visina 3 m, sa nadstrešnicom…' : 'npr. teren je u nagibu, treba mi otvor za duplu kapiju…'}
          value={s.note}
          onChange={(e) => c.update({ note: e.target.value })}
        />
      </div>
      <div className="mt-6">
        <FileUpload files={c.files} onChange={c.setFiles} title={sketch ? 'Dodatni fajlovi' : undefined} />
      </div>
    </div>
  )
}
