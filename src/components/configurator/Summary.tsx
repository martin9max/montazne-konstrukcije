import { useState } from 'react'
import { pricing } from '../../config/pricing'
import { summaryRows, type ConfigState } from '../../lib/configState'
import { estimatePrice, PRICE_ON_REQUEST } from '../../lib/priceCalc'
import { fmtMoney } from '../../lib/format'

export function Summary({ state, onReset, compact = false }: { state: ConfigState; onReset?: () => void; compact?: boolean }) {
  const rows = summaryRows(state)
  const price = estimatePrice(state)
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: 'Moja konstrukcija', url })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      /* korisnik je odustao */
    }
  }

  return (
    <section aria-label="Sažetak konfiguracije" className={compact ? '' : 'border-2 border-steel bg-white'}>
      {!compact && (
        <h3 className="eyebrow border-b-2 border-steel px-5 py-3 text-steel">Sažetak</h3>
      )}
      <dl className={compact ? '' : 'px-5'}>
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 border-b border-line py-2.5 text-[0.95rem] last:border-b-0">
            <dt className="shrink-0 text-ink-soft">{r.label}</dt>
            <dd className="text-right font-semibold">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className={`bg-navy text-white ${compact ? 'mt-3 p-4' : 'p-5'}`}>
        {price != null ? (
          <>
            <p className="eyebrow text-white/70">Okvirna cena</p>
            <p className="display mt-1 text-3xl">
              {fmtMoney(price, pricing.currency)} <span className="font-sans text-base font-semibold normal-case tracking-normal text-white/70">okvirno</span>
            </p>
            {state.transport && <p className="mt-1 text-sm text-white/70">Prevoz se obračunava po km, prema lokaciji.</p>}
          </>
        ) : (
          <p className="font-semibold">{PRICE_ON_REQUEST}</p>
        )}
      </div>
      {onReset && (
        <div className={`flex flex-wrap gap-x-5 gap-y-2 text-sm ${compact ? 'mt-4' : 'px-5 py-4'}`}>
          <button type="button" onClick={share} className="font-bold text-navy underline underline-offset-4">
            {copied ? 'Link je kopiran' : 'Podeli link konfiguracije'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Obrisati konfiguraciju i krenuti ispočetka?')) onReset()
            }}
            className="font-bold text-ink-soft underline underline-offset-4 hover:text-red-700"
          >
            Kreni ispočetka
          </button>
        </div>
      )}
    </section>
  )
}
