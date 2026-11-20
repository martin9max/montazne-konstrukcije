import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useConfigurator } from '../lib/useConfigurator'
import { Stepper } from '../components/configurator/Stepper'
import { PreviewPanel } from '../components/configurator/preview/PreviewPanel'
import { Summary } from '../components/configurator/Summary'
import { TypeStep } from '../components/configurator/steps/TypeStep'
import { DimsStep } from '../components/configurator/steps/DimsStep'
import { JoiningStep } from '../components/configurator/steps/JoiningStep'
import { ColorStep } from '../components/configurator/steps/ColorStep'
import { ExtrasStep } from '../components/configurator/steps/ExtrasStep'
import { PurposeStep } from '../components/configurator/steps/PurposeStep'
import { ReviewStep } from '../components/configurator/steps/ReviewStep'
import { OrderForm } from '../components/configurator/OrderForm'
import { Seo } from '../components/ui/Seo'
import { ArrowLeft, ArrowRight, ChevronDown, CloseIcon, PhoneIcon } from '../components/ui/Icons'
import { business } from '../config/business'
import { isBuildType, getProduct } from '../config/products'
import { area, summaryRows } from '../lib/configState'
import { fmtNum } from '../lib/format'
import { validateContact, type ContactData, type ContactErrors } from '../lib/validation'
import { encodeFiles } from '../lib/files'
import { postJSON } from '../lib/api'
import { clearLocal } from '../lib/urlState'
import { clearSketchStorage } from '../lib/useSketch'
import { exportDrawing } from '../lib/exportDrawing'

const FORM_ID = 'porudzbina'
const emptyContact: ContactData = { name: '', phone: '', email: '', address: '', preferredDate: '', consent: false }

export default function Configurator() {
  const c = useConfigurator()
  const navigate = useNavigate()
  const [dir, setDir] = useState(1)
  const [contact, setContact] = useState<ContactData>(emptyContact)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [honeypot, setHoneypot] = useState('')
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [sheet, setSheet] = useState(false)
  const [showStepError, setShowStepError] = useState(false)
  const panelTop = useRef<HTMLDivElement>(null)
  const prevStep = useRef(c.step)

  // pri promeni koraka: smer animacije i skrol na vrh panela
  useEffect(() => {
    if (prevStep.current === c.step) return
    setDir(c.step > prevStep.current ? 1 : -1)
    prevStep.current = c.step
    setShowStepError(false)
    const el = panelTop.current
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - (window.innerWidth >= 1024 ? 100 : window.innerHeight * 0.34 + 80)
      if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top) })
    }
  }, [c.step])

  useEffect(() => {
    document.body.style.overflow = sheet ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheet])

  const isLast = c.current.id === 'pregled'

  const goNext = () => {
    if (c.stepError) {
      setShowStepError(true)
      return
    }
    c.next()
  }

  const submit = async () => {
    const errs = validateContact(contact)
    setErrors(errs)
    setSubmitError(null)
    if (Object.keys(errs).length) {
      const firstKey = Object.keys(errs)[0]
      document.getElementById(`${FORM_ID}-${firstKey === 'consent' ? 'name' : firstKey}`)?.focus()
      return
    }
    setSending(true)
    try {
      const sketchFiles = c.state.type === 'skica' ? await c.sketch.exportFiles() : []
      // crtež konstrukcije kakav kupac vidi (greška ovde ne sme da blokira porudžbinu)
      const drawing = await exportDrawing(c.state).catch(() => null)
      const files = await encodeFiles([...(drawing ? [drawing] : []), ...sketchFiles, ...c.files])
      const res = await postJSON<{ ok: true; orderId: string }>(
        '/api/order',
        {
          kind: 'order',
          config: c.state,
          contact,
          files,
          sketchDims: c.state.type === 'skica' ? c.sketch.dimTexts : [],
          website: honeypot,
          configUrl: window.location.href,
        },
        60000,
      )
      const success = { orderId: res.orderId, rows: summaryRows(c.state), phone: contact.phone, configUrl: window.location.href }
      try {
        sessionStorage.setItem('mk-last-order', JSON.stringify(success))
      } catch {
        /* nije kritično */
      }
      clearLocal()
      clearSketchStorage()
      navigate('/porudzbina-poslata', { state: success })
    } catch (e) {
      setSubmitError(e instanceof Error && e.message ? e.message : 'Došlo je do greške.')
    } finally {
      setSending(false)
    }
  }

  const stepBody = (() => {
    switch (c.current.id) {
      case 'tip':
        return <TypeStep c={c} />
      case 'dimenzije':
        return <DimsStep c={c} />
      case 'spajanje':
        return <JoiningStep c={c} />
      case 'boja':
        return <ColorStep c={c} />
      case 'dodaci':
        return <ExtrasStep c={c} />
      case 'namena':
        return <PurposeStep c={c} />
      case 'pregled':
        return (
          <ReviewStep
            c={c}
            form={
              <OrderForm
                formId={FORM_ID}
                contact={contact}
                setContact={(v) => {
                  setContact(v)
                  if (Object.keys(errors).length) setErrors(validateContact(v))
                }}
                errors={errors}
                honeypot={honeypot}
                setHoneypot={setHoneypot}
                onSubmit={submit}
                sending={sending}
                submitError={submitError}
              />
            }
          />
        )
    }
  })()

  const s = c.state
  const compactLine = isBuildType(s.type)
    ? `${getProduct(s.type).shortName} · ${fmtNum(s.length, 1)}×${fmtNum(s.width, 1)} m · ${fmtNum(area(s), 1)} m²`
    : 'Po Vašoj skici'

  return (
    <div className="lg:grid lg:grid-cols-[3fr_2fr]">
      <Seo
        title={`Konfigurator konstrukcije | Montažne Konstrukcije ${business.place}`}
        description="Sklopite svoju metalnu konstrukciju: tip, dimenzije, spajanje, boja i dodaci. Pogledajte prikaz sa merama i pošaljite porudžbinu."
        path="/konfigurator"
      />
      <h1 className="sr-only">Konfigurator konstrukcije</h1>

      {/* PRIKAZ: mobilni – sticky gore; desktop – levo, sticky */}
      <div
        className={`z-20 border-b border-line lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:border-b-0 lg:border-r ${
          s.type === 'skica' ? 'relative h-[64vh] min-h-[380px]' : 'sticky top-[4.5rem] h-[34vh] min-h-[220px]'
        }`}
      >
        <PreviewPanel state={s} sketch={c.sketch} className="h-full" />
      </div>

      {/* PANEL */}
      <div className="pb-36 lg:pb-16">
        <div ref={panelTop} className="mx-auto max-w-xl px-4 pt-5 md:px-8 lg:pt-8">
          <Stepper c={c} />
          <div className="relative mt-7 overflow-x-clip">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <m.div
                key={c.current.id}
                custom={dir}
                initial={{ opacity: 0, x: 24 * dir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 * dir }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {stepBody}
              </m.div>
            </AnimatePresence>
          </div>

          {showStepError && c.stepError && (
            <p className="mt-5 border-l-4 border-red-700 bg-red-50 p-3 font-semibold text-red-900" role="alert">
              {c.stepError}
            </p>
          )}

          {/* navigacija – desktop */}
          <div className="mt-8 hidden items-center justify-between gap-3 lg:flex">
            {c.step > 0 ? (
              <button type="button" onClick={c.back} className="btn btn-outline-dark h-14">
                <ArrowLeft /> Nazad
              </button>
            ) : (
              <span />
            )}
            {!isLast && (
              <button type="button" onClick={goNext} className="btn btn-primary h-14 px-8 text-lg">
                Dalje <ArrowRight />
              </button>
            )}
          </div>

          {!isLast && (
            <div className="mt-10 hidden lg:block">
              <Summary state={s} onReset={c.reset} />
            </div>
          )}
          {isLast && (
            <div className="mt-6 hidden lg:block">
              <button type="button" onClick={c.reset} className="text-sm font-bold text-ink-soft underline underline-offset-4">
                Kreni ispočetka
              </button>
            </div>
          )}

          <p className="mt-10 text-center text-ink-soft">
            Lakše Vam je telefonom?{' '}
            <a href={business.phoneHref} className="font-bold text-navy underline underline-offset-4">
              Pozovite {business.phoneDisplay}
            </a>
          </p>
        </div>
      </div>

      {/* MOBILNA traka na dnu */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-steel bg-paper lg:hidden">
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="flex w-full items-center justify-between gap-3 px-4 pt-2.5 text-left"
          aria-haspopup="dialog"
        >
          <span className="min-w-0">
            <span className="eyebrow block text-[0.62rem] text-ink-soft">Sažetak</span>
            <span className="block truncate text-sm font-bold tabular-nums">{compactLine}</span>
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 rotate-180 text-navy" />
        </button>
        <div className="flex gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          {c.step > 0 && (
            <button type="button" onClick={c.back} className="btn btn-outline-dark h-13 min-h-13 w-14 shrink-0 px-0" aria-label="Nazad">
              <ArrowLeft />
            </button>
          )}
          <a href={business.phoneHref} className="btn btn-outline-dark h-13 min-h-13 w-14 shrink-0 px-0" aria-label={`Pozovite ${business.phoneDisplay}`}>
            <PhoneIcon />
          </a>
          {isLast ? (
            <button type="submit" form={FORM_ID} className="btn btn-primary min-h-13 flex-1 text-base" disabled={sending}>
              {sending ? 'Šaljem…' : 'Pošalji porudžbinu'}
            </button>
          ) : (
            <button type="button" onClick={goNext} className="btn btn-primary min-h-13 flex-1 text-base">
              Dalje <ArrowRight />
            </button>
          )}
        </div>
      </div>

      {/* MOBILNI sažetak */}
      <AnimatePresence>
        {sheet && (
          <m.div className="fixed inset-0 z-50 flex flex-col justify-end bg-steel/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
            <m.div
              role="dialog"
              aria-modal="true"
              aria-label="Sažetak"
              className="max-h-[85vh] overflow-y-auto bg-paper p-5 pb-8"

              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="display text-2xl">Sažetak</h2>
                <button type="button" onClick={() => setSheet(false)} className="flex h-11 w-11 items-center justify-center border-2 border-steel" aria-label="Zatvori sažetak" autoFocus>
                  <CloseIcon />
                </button>
              </div>
              <Summary state={s} onReset={() => { c.reset(); setSheet(false) }} compact />
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
