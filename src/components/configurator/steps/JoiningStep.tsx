import { joiningOptions } from '../../../config/options'
import type { Configurator } from '../../../lib/useConfigurator'
import { ChoiceCard, StepTitle } from '../ui'

const icons = {
  sraf: (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 18 H44 M4 30 H44" />
      <path d="M18 10 h12 v5 h-12z M22 15 v22 M26 15 v22 M20 37 h8" />
      <path d="M22 20 l4 2 M22 25 l4 2 M22 30 l4 2" strokeOpacity=".6" />
    </svg>
  ),
  var: (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 16 H22 V32 H4 M44 16 H26 V32 H44" />
      <path d="M24 14 c-3 3 3 4 0 7 s3 4 0 7 s3 4 0 7" />
    </svg>
  ),
}

export function JoiningStep({ c }: { c: Configurator }) {
  return (
    <fieldset>
      <legend className="sr-only">Spajanje</legend>
      <StepTitle title="Spajanje" text="Konstrukcije radimo na šrafljenje ili zavarene." />
      <div className="grid gap-3">
        {joiningOptions.map((j) => (
          <ChoiceCard
            key={j.id}
            name="spajanje"
            value={j.id}
            selected={c.state.joining === j.id}
            onSelect={() => c.update({ joining: j.id })}
            title={j.name}
            text={j.text}
            icon={icons[j.id]}
          />
        ))}
      </div>
    </fieldset>
  )
}
