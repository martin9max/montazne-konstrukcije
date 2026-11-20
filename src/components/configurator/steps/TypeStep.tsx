import { products } from '../../../config/products'
import type { Configurator } from '../../../lib/useConfigurator'
import { ChoiceCard, StepTitle } from '../ui'
import { TypeIcon } from '../TypeIcon'

export function TypeStep({ c }: { c: Configurator }) {
  return (
    <fieldset>
      <legend className="sr-only">Tip konstrukcije</legend>
      <StepTitle title="Tip konstrukcije" text="Izaberite šta Vam treba. Sve dimenzije menjate u sledećem koraku." />
      <div className="grid gap-3">
        {products.map((p) => (
          <ChoiceCard
            key={p.id}
            name="tip"
            value={p.id}
            selected={c.state.type === p.id}
            onSelect={() => c.setType(p.id)}
            title={p.name}
            text={p.description}
            icon={<TypeIcon type={p.id} />}
          />
        ))}
      </div>
    </fieldset>
  )
}
