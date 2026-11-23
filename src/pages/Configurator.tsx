import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { business } from '../config/business'
import { getProduct, isBuildType, products, type ProductType } from '../config/products'
import { area, changeType, initialState, sanitize, summaryRows, type ConfigState } from '../lib/configState'
import { clearLocal, fromQuery, loadLocal, saveLocal, toQuery } from '../lib/urlState'
import { clearSketchStorage, useSketch } from '../lib/useSketch'
import { exportDrawing, DRAWING_CONTAINER_ID } from '../lib/exportDrawing'
import { encodeFiles } from '../lib/files'
import { postJSON } from '../lib/api'
import { fmtNum, round1, clamp } from '../lib/format'
import { validateContact, validateDims, type ContactData, type ContactErrors } from '../lib/validation'
import { StructurePreview } from '../components/configurator/preview/StructurePreview'
import { SketchEditor } from '../components/configurator/sketch/SketchEditor'
import { SketchControls } from '../components/configurator/sketch/SketchControls'
import { TypeIcon } from '../components/configurator/TypeIcon'
import { Photo } from '../components/ui/Photo'
import { Seo } from '../components/ui/Seo'
import { CheckIcon, PhoneIcon } from '../components/ui/Icons'
import { colorHex } from '../lib/configState'

/**
 * Upit na jednom ekranu: 1) tip konstrukcije, 2) dimenzije (ili skica), 3) kontakt.
 * Spajanje, boja i dodaci se dogovaraju telefonom.
 */
const CARD: Record<ProductType, { title: string; text: string }> = {
  aframe: { title: 'A-frame vikendica', text: 'Trouglasti ram, moguća galerija' },
  kontejnerska: { title: 'Kontejnerska', text: 'Pravougaona, ravan krov' },
  skica: { title: 'Imam svoju skicu', text: 'Slikajte skicu telefonom' },
}

const emptyContact: ContactData = { name: '', phone: '', email: '', address: '', preferredDate: '', consent: true }

function initState(): ConfigState {
  const fromUrl = fromQuery(window.location.search, loadLocal()?.state)
  return fromUrl ?? loadLocal()?.state ?? initialState('aframe')
}

export default function Configurator() {
  const navigate = useNavigate()
  const [state, setState] = useState<ConfigState>(initState)
  const sketch = useSketch()
  const [contact, setContact] = useState<ContactData>(emptyContact)
  const [errors, setErrors] = useState<ContactErrors & { dims?: string; sketch?: string }>({})
  const [honeypot, setHoneypot] = useState('')
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const dimsRef = useRef<HTMLDivElement>(null)

  const update = (patch: Partial<ConfigState>) => setState((s) => sanitize({ ...s, ...patch }))
  const p = getProduct(state.type)
  const build = isBuildType(state.type)

  // čuvanje u linku i u pregledaču
  useEffect(() => {
    const url = `${window.location.pathname}?${toQuery(state)}`
    history.replaceState(history.state, '', url)
    saveLocal({ state, step: 0, maxStep: 0 })
  }, [state])

  const chooseType = (t: ProductType) => {
    setState((s) => changeType(s, t))
    setErrors({})
    // na telefonu: odmah pokaži sledeći blok
    setTimeout(() => {
      if (window.innerWidth < 768) dimsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const errs: typeof errors = { ...validateContact(contact) }
    if (build) {
      const d = validateDims(state.type, state.length, state.width, state.height)
      if (d) errs.dims = d
    } else {
      if (!sketch.hasSketch && state.note.trim().length < 10) errs.sketch = 'Slikajte skicu ili u napomeni opišite šta Vam treba.'
      else if (sketch.missingValues) errs.sketch = 'Upišite meru za svaku kotu na skici (ili obrišite praznu).'
    }
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = errs.dims || errs.sketch ? 'blok-2' : `upit-${Object.keys(errs)[0]}`
      document.getElementById(first)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSending(true)
    try {
      const drawing = await exportDrawing(state).catch(() => null)
      const sketchFiles = build ? [] : await sketch.exportFiles()
      const files = await encodeFiles([...(drawing ? [drawing] : []), ...sketchFiles])
      const res = await postJSON<{ ok: true; orderId: string }>(
        '/api/order',
        {
          kind: 'order',
          config: state,
          contact: { ...contact, consent: true },
          files,
          sketchDims: build ? [] : sketch.dimTexts,
          website: honeypot,
          configUrl: window.location.href,
        },
        60000,
      )
      const success = { orderId: res.orderId, rows: summaryRows(state), phone: contact.phone }
      try {
        sessionStorage.setItem('mk-last-order', JSON.stringify(success))
      } catch {
        /* nije kritično */
      }
      clearLocal()
      clearSketchStorage()
      navigate('/porudzbina-poslata', { state: success })
    } catch (err) {
      setSubmitError(err instanceof Error && err.message ? err.message : 'Došlo je do greške.')
    } finally {
      setSending(false)
    }
  }

  const field = (k: 'name' | 'phone' | 'email' | 'address') => ({
    id: `upit-${k}`,
    value: contact[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...contact, [k]: e.target.value }
      setContact(next)
      if (errors[k]) setErrors((x) => ({ ...x, [k]: validateContact(next)[k] }))
    },
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `upit-${k}-e` : undefined,
  })
  const Err = ({ k }: { k: 'name' | 'phone' | 'email' | 'address' }) =>
    errors[k] ? (
      <p id={`upit-${k}-e`} className="mt-1.5 text-sm font-semibold text-red-700">
        {errors[k]}
      </p>
    ) : null

  return (
    <div className="bg-paper">
      <Seo
        title={`Zatražite ponudu | Montažne Konstrukcije ${business.place}`}
        description="Izaberite konstrukciju i dimenzije, ostavite broj telefona i javljamo se u roku od 24h sa cenom."
        path="/konfigurator"
      />
      <div className="container-x max-w-4xl py-10 md:py-16">
        <h1 className="display text-4xl md:text-6xl">Zatražite ponudu</h1>
        <p className="mt-4 max-w-xl text-lg text-ink-soft">
          Tri kratka koraka. Javljamo se {business.responseTime} sa cenom. Boju, spajanje i dodatke dogovaramo telefonom.
        </p>

        <form onSubmit={submit} noValidate className="mt-10 space-y-6 md:mt-12">
          {/* 1. TIP */}
          <Block n={1} title="Koja konstrukcija?">
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Tip konstrukcije">
              {products.map((x) => {
                const sel = state.type === x.id
                return (
                  <button
                    key={x.id}
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    onClick={() => chooseType(x.id)}
                    className={`group relative flex flex-row overflow-hidden border-2 bg-white text-left transition-colors sm:flex-col ${
                      sel ? 'border-navy' : 'border-line hover:border-navy/40'
                    }`}
                  >
                    <span
                      className="relative block aspect-square w-28 shrink-0 overflow-hidden bg-paper sm:aspect-[4/3] sm:w-full"
                      style={{ ['--pos' as string]: x.imagePosition ?? '50% 50%' }}
                    >
                      {x.id === 'skica' ? (
                        <span className="blueprint flex h-full w-full items-center justify-center text-navy">
                          <TypeIcon type="skica" className="h-14 w-16 sm:h-20 sm:w-24" />
                        </span>
                      ) : (
                        <Photo name={x.image} alt="" sizes="(min-width: 640px) 30vw, 112px" className="[object-position:var(--pos)]" />
                      )}
                    </span>
                    <span className="flex flex-1 flex-col justify-center p-4">
                      <span className="text-lg font-bold leading-tight">{CARD[x.id].title}</span>
                      <span className="mt-1 text-sm text-ink-soft">{CARD[x.id].text}</span>
                    </span>
                    {sel && (
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-navy text-white" aria-hidden="true">
                        <CheckIcon className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Block>

          {/* 2. DIMENZIJE ili SKICA */}
          <div ref={dimsRef} id="blok-2" className="scroll-mt-24">
            {build ? (
              <Block n={2} title="Koje dimenzije?">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="label">Gotove dimenzije</p>
                    <div className="flex flex-wrap gap-2">
                      {p.presets.map((pr) => {
                        const active = state.presetId === pr.id
                        return (
                          <button
                            key={pr.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => update({ presetId: pr.id, length: pr.length, width: pr.width, height: pr.height })}
                            className={`min-h-12 border-2 px-4 text-base font-bold ${active ? 'border-navy bg-navy text-white' : 'border-line bg-white hover:border-navy/50'}`}
                          >
                            {pr.label} m
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        aria-pressed={state.presetId === null}
                        onClick={() => update({ presetId: null })}
                        className={`min-h-12 border-2 px-4 text-base font-bold ${state.presetId === null ? 'border-navy bg-navy text-white' : 'border-line bg-white hover:border-navy/50'}`}
                      >
                        Druga dimenzija
                      </button>
                    </div>

                    {state.presetId === null && p.limits && (
                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <NumField label="Dužina" value={state.length} min={p.limits.length.min} max={p.limits.length.max} onChange={(v) => update({ length: v })} />
                        <NumField label="Širina" value={state.width} min={p.limits.width.min} max={p.limits.width.max} onChange={(v) => update({ width: v })} />
                        <NumField label="Visina" value={state.height} min={p.limits.height.min} max={p.limits.height.max} onChange={(v) => update({ height: v })} />
                      </div>
                    )}

                    <p className="mt-5 text-lg">
                      <span className="text-ink-soft">Izabrano: </span>
                      <strong className="tabular-nums">
                        {fmtNum(state.length, 1)} × {fmtNum(state.width, 1)} m, visina {fmtNum(state.height, 1)} m · {fmtNum(area(state), 1)} m²
                      </strong>
                    </p>
                    {errors.dims && <p className="mt-2 font-semibold text-red-700" role="alert">{errors.dims}</p>}
                  </div>

                  {/* mali crtež, služi i kao slika koja ide vlasniku */}
                  <div id={DRAWING_CONTAINER_ID} className="blueprint border border-line">
                    <StructurePreview
                      className="h-auto w-full"
                      title={`Crtež: ${p.name}`}
                      input={{
                        type: state.type as 'aframe' | 'kontejnerska',
                        length: state.length,
                        width: state.width,
                        height: state.height,
                        gallery: false,
                        galleryDepth: 0,
                        terrace: false,
                        terraceLength: 0,
                        terraceDepth: 0,
                        color: colorHex(state),
                      }}
                    />
                  </div>
                </div>
              </Block>
            ) : (
              <Block n={2} title="Vaša skica">
                {sketch.hasSketch && (
                  <div className="blueprint mb-5 h-72 border border-line p-2 md:h-96">
                    {sketch.processed ? <SketchEditor sketch={sketch} /> : <p className="flex h-full items-center justify-center font-semibold text-navy">Obrađujem skicu…</p>}
                  </div>
                )}
                <SketchControls sketch={sketch} />
                {errors.sketch && <p className="mt-3 font-semibold text-red-700" role="alert">{errors.sketch}</p>}
              </Block>
            )}
          </div>

          {/* 3. KONTAKT */}
          <Block n={3} title="Kako da Vas kontaktiramo?">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="upit-name" className="label">Ime i prezime *</label>
                <input className="field" autoComplete="name" {...field('name')} />
                <Err k="name" />
              </div>
              <div>
                <label htmlFor="upit-phone" className="label">Telefon *</label>
                <input className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="065 123 4567" {...field('phone')} />
                <Err k="phone" />
              </div>
              <div>
                <label htmlFor="upit-email" className="label">Email</label>
                <input className="field" type="email" inputMode="email" autoComplete="email" {...field('email')} />
                <Err k="email" />
              </div>
              <div>
                <label htmlFor="upit-address" className="label">Mesto</label>
                <input className="field" autoComplete="address-level2" placeholder="npr. Leskovac" {...field('address')} />
                <Err k="address" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="upit-note" className="label">
                  Napomena <span className="font-normal text-ink-soft">(nije obavezno)</span>
                </label>
                <textarea
                  id="upit-note"
                  className="field min-h-24"
                  rows={3}
                  maxLength={2000}
                  placeholder="npr. treba mi sa galerijom, crna boja…"
                  value={state.note}
                  onChange={(e) => update({ note: e.target.value })}
                />
              </div>
            </div>
            <div className="hidden" aria-hidden="true">
              <label htmlFor="upit-web">Ne popunjavati</label>
              <input id="upit-web" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            {submitError && (
              <div className="mt-5 border-l-4 border-red-700 bg-red-50 p-4 text-red-900" role="alert">
                <p className="font-bold">Upit nije poslat.</p>
                <p className="mt-1">
                  {submitError} Pokušajte ponovo ili nas pozovite na{' '}
                  <a href={business.phoneHref} className="font-bold underline">{business.phoneDisplay}</a>.
                </p>
              </div>
            )}

            <button type="submit" disabled={sending} className="btn btn-primary mt-6 h-16 w-full text-xl">
              {sending ? 'Šaljem…' : 'Pošalji upit'}
            </button>
            <p className="mt-3 text-center text-sm text-ink-soft">Slanje nije obavezujuće. Slanjem pristajete da Vas kontaktiramo.</p>
          </Block>
        </form>

        <p className="mt-10 text-center text-lg">
          Lakše Vam je telefonom?{' '}
          <a href={business.phoneHref} className="inline-flex items-center gap-2 font-bold text-navy underline underline-offset-4">
            <PhoneIcon className="h-5 w-5" /> {business.phoneDisplay}
          </a>
        </p>
      </div>
    </div>
  )
}

function Block({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-white p-5 md:p-8" aria-labelledby={`blok-${n}-naslov`}>
      <h2 id={`blok-${n}-naslov`} className="mb-5 flex items-center gap-3 text-xl font-extrabold md:text-2xl">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-navy font-mono text-base text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Jednostavno polje za broj u metrima (prihvata i zarez) */
function NumField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(fmtNum(value, 1))
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (!focused) setText(fmtNum(value, 1))
  }, [value, focused])
  const id = `dim-${label}`
  const commit = (raw: string) => {
    const n = Number(raw.replace(',', '.'))
    if (!raw.trim() || isNaN(n)) return setText(fmtNum(value, 1))
    const v = round1(clamp(n, min, max))
    onChange(v)
    setText(fmtNum(v, 1))
  }
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="flex items-center border-[1.5px] border-line bg-white focus-within:border-navy">
        <input
          id={id}
          inputMode="decimal"
          className="h-12 w-full min-w-0 bg-transparent px-3 text-lg font-bold tabular-nums outline-none"
          value={text}
          onFocus={() => setFocused(true)}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => {
            setFocused(false)
            commit(e.target.value)
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), commit((e.target as HTMLInputElement).value))}
          aria-describedby={`${id}-h`}
        />
        <span className="pr-3 text-ink-soft">m</span>
      </div>
      <p id={`${id}-h`} className="mt-1 text-xs text-ink-soft">
        {fmtNum(min, 1)}–{fmtNum(max, 1)} m
      </p>
    </div>
  )
}
