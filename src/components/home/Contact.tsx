import { useState } from 'react'
import { business } from '../../config/business'
import { SectionHeading } from '../ui/SectionHeading'
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon } from '../ui/Icons'
import { isValidSerbianPhone } from '../../lib/validation'
import { postJSON } from '../../lib/api'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '', website: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 2) errs.name = 'Upišite ime.'
    if (!isValidSerbianPhone(form.phone)) errs.phone = 'Broj nije ispravan. Primer: 065 123 4567'
    if (form.message.trim().length < 5) errs.message = 'Upišite pitanje.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStatus('sending')
    try {
      await postJSON('/api/order', { kind: 'question', ...form })
      setStatus('sent')
      setForm({ name: '', phone: '', message: '', website: '' })
    } catch {
      setStatus('error')
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <section id="kontakt" className="scroll-mt-24 bg-steel py-20 text-white md:py-28" aria-labelledby="kontakt-title">
      <div className="container-x grid gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading id="kontakt-title" eyebrow="Javite se" title="Kontakt" light />
          <a href={business.phoneHref} className="group block" data-reveal>
            <span className="eyebrow text-white/50">Telefon</span>
            <span className="display mt-2 flex items-center gap-4 text-4xl group-hover:underline sm:text-5xl">
              <PhoneIcon className="h-8 w-8 shrink-0" />
              {business.phoneDisplay}
            </span>
          </a>
          <ul className="mt-10 space-y-4 text-lg" data-reveal>
            <li>
              <a href={`mailto:${business.email}`} className="flex items-center gap-3 break-all hover:underline">
                <MailIcon className="h-5 w-5 shrink-0 text-white/60" /> {business.email}
              </a>
            </li>
            <li>
              <a href={business.instagram.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:underline">
                <InstagramIcon className="h-5 w-5 shrink-0 text-white/60" /> {business.instagram.handle}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <PinIcon className="h-5 w-5 shrink-0 text-white/60" />
              {business.mapUrl ? (
                <a href={business.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {business.address ?? business.place}
                </a>
              ) : (
                <span>
                  {business.address ?? business.place}
                  {business.serviceArea && <span className="text-white/60"> · isporuka: {business.serviceArea}</span>}
                </span>
              )}
            </li>
          </ul>
        </div>

        <form onSubmit={submit} noValidate className="border border-white/15 bg-white/[0.03] p-6 md:p-10" data-reveal>
          <h3 className="display text-2xl md:text-3xl">Imate pitanje?</h3>
          <p className="mt-2 text-white/70">Ostavite broj, javljamo se {business.responseTime}.</p>
          {status === 'sent' ? (
            <p className="mt-8 border-l-4 border-white bg-white/10 p-4 text-lg font-semibold" role="status">
              Hvala! Pitanje je poslato. Javljamo se uskoro.
            </p>
          ) : (
            <div className="mt-8 space-y-5">
              <div>
                <label htmlFor="q-name" className="label">Ime</label>
                <input id="q-name" className="field" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'q-name-e' : undefined} />
                {errors.name && <p id="q-name-e" className="mt-1.5 text-sm text-red-300">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="q-phone" className="label">Telefon</label>
                <input id="q-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="065 123 4567" value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'q-phone-e' : undefined} />
                {errors.phone && <p id="q-phone-e" className="mt-1.5 text-sm text-red-300">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="q-msg" className="label">Pitanje</label>
                <textarea id="q-msg" className="field min-h-28" rows={4} value={form.message} onChange={set('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'q-msg-e' : undefined} />
                {errors.message && <p id="q-msg-e" className="mt-1.5 text-sm text-red-300">{errors.message}</p>}
              </div>
              {/* honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="q-web">Ne popunjavati</label>
                <input id="q-web" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
              </div>
              {status === 'error' && (
                <p className="border-l-4 border-red-400 bg-red-500/10 p-4" role="alert">
                  Poruka nije poslata. Pokušajte ponovo ili nas pozovite na{' '}
                  <a href={business.phoneHref} className="font-bold underline">{business.phoneDisplay}</a>.
                </p>
              )}
              <button type="submit" className="btn btn-light h-14 w-full text-lg" disabled={status === 'sending'}>
                {status === 'sending' ? 'Šaljem…' : 'Pošalji pitanje'}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
