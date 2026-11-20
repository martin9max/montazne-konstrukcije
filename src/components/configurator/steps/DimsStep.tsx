import { AnimatePresence, m } from 'framer-motion'
import { getProduct } from '../../../config/products'
import { area } from '../../../lib/configState'
import { fmtNum } from '../../../lib/format'
import type { Configurator } from '../../../lib/useConfigurator'
import { Chip, DimInput, StepTitle } from '../ui'

export function DimsStep({ c }: { c: Configurator }) {
  const p = getProduct(c.state.type)
  const s = c.state
  if (!p.limits) return null
  const a = area(s)
  return (
    <div>
      <StepTitle title="Dimenzije" text="Izaberite neku od mera koje smo već radili, ili podesite po meri." />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Gotove dimenzije">
        {p.presets.map((pr) => (
          <Chip
            key={pr.id}
            active={s.presetId === pr.id}
            onClick={() => c.update({ presetId: pr.id, length: pr.length, width: pr.width, height: pr.height, terraceLength: s.type === 'aframe' ? pr.width : pr.length })}
            label={`${pr.label} metara`}
          >
            {pr.label} m
          </Chip>
        ))}
        <Chip active={s.presetId === null} onClick={() => c.update({ presetId: null })}>
          Po meri
        </Chip>
      </div>

      <div className="mt-6 space-y-4">
        <DimInput label={p.labels.length} value={s.length} min={p.limits.length.min} max={p.limits.length.max} onChange={(v) => c.update({ length: v, presetId: null })} />
        <DimInput label={p.labels.width} value={s.width} min={p.limits.width.min} max={p.limits.width.max} onChange={(v) => c.update({ width: v, presetId: null })} />
        <DimInput label={p.labels.height} value={s.height} min={p.limits.height.min} max={p.limits.height.max} onChange={(v) => c.update({ height: v, presetId: null })} />
      </div>

      <div className="mt-6 flex items-baseline justify-between bg-navy px-5 py-4 text-white" aria-live="polite">
        <span className="eyebrow text-white/70">Površina osnove</span>
        <span className="display text-3xl tabular-nums">
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span key={a} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }} className="inline-block">
              {fmtNum(a, 1)}
            </m.span>
          </AnimatePresence>{' '}
          m²
        </span>
      </div>
      {s.type === 'aframe' && (
        <p className="mt-3 text-sm text-ink-soft">Kod A-frame konstrukcije korisna površina je manja od osnove zbog kosih zidova.</p>
      )}
    </div>
  )
}
