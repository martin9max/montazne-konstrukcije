import { m } from 'framer-motion'
import type { Configurator } from '../../lib/useConfigurator'
import { CheckIcon } from '../ui/Icons'

export function Stepper({ c }: { c: Configurator }) {
  const total = c.steps.length
  const pct = ((c.step + 1) / total) * 100
  return (
    <nav aria-label="Koraci konfiguratora">
      <div className="flex items-center justify-between text-sm">
        <p className="font-bold">
          Korak {c.step + 1} od {total}
          <span className="font-normal text-ink-soft"> · {c.current.label}</span>
        </p>
      </div>
      <div className="mt-2 h-1 bg-line" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={c.step + 1} aria-label="Napredak">
        <m.div className="h-full bg-navy" animate={{ width: `${pct}%` }} transition={{ duration: 0.35, ease: 'easeOut' }} />
      </div>
      <ol className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {c.steps.map((s, i) => {
          const done = i < c.step || (i <= c.maxStep && i !== c.step)
          const active = i === c.step
          const reachable = i <= c.maxStep
          return (
            <li key={s.id} className="shrink-0">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => c.goTo(i)}
                aria-current={active ? 'step' : undefined}
                aria-label={`Korak ${i + 1}: ${s.label}${done ? ' (završen)' : ''}`}
                className={`flex h-9 items-center gap-1.5 border px-2.5 text-xs font-bold transition-colors ${
                  active
                    ? 'border-navy bg-navy text-white'
                    : reachable
                      ? 'border-navy/40 bg-white text-navy hover:border-navy'
                      : 'border-line bg-transparent text-ink-soft/60'
                }`}
              >
                {done && !active ? <CheckIcon className="h-3.5 w-3.5" /> : <span className="tabular-nums">{i + 1}</span>}
                <span>{s.short}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
