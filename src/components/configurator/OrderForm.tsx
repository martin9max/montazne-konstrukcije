import { business } from '../../config/business'
import type { ContactData, ContactErrors } from '../../lib/validation'

export function OrderForm({
  formId,
  contact,
  setContact,
  errors,
  honeypot,
  setHoneypot,
  onSubmit,
  sending,
  submitError,
}: {
  formId: string
  contact: ContactData
  setContact: (c: ContactData) => void
  errors: ContactErrors
  honeypot: string
  setHoneypot: (v: string) => void
  onSubmit: () => void
  sending: boolean
  submitError: string | null
}) {
  const field = (k: keyof ContactData) => ({
    value: contact[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setContact({ ...contact, [k]: e.target.value }),
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `${formId}-${k}-e` : undefined,
  })
  const Err = ({ k }: { k: keyof ContactData }) =>
    errors[k] ? (
      <p id={`${formId}-${k}-e`} className="mt-1.5 text-sm font-semibold text-red-700">
        {errors[k]}
      </p>
    ) : null

  return (
    <form
      id={formId}
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="space-y-5"
    >
      <h3 className="display text-2xl">Vaši podaci</h3>
      <div>
        <label htmlFor={`${formId}-name`} className="label">Ime i prezime *</label>
        <input id={`${formId}-name`} className="field" autoComplete="name" {...field('name')} />
        <Err k="name" />
      </div>
      <div>
        <label htmlFor={`${formId}-phone`} className="label">Telefon *</label>
        <input id={`${formId}-phone`} className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="065 123 4567" {...field('phone')} />
        <Err k="phone" />
      </div>
      <div>
        <label htmlFor={`${formId}-email`} className="label">Email <span className="font-normal text-ink-soft">(ako želite potvrdu na email)</span></label>
        <input id={`${formId}-email`} className="field" type="email" inputMode="email" autoComplete="email" {...field('email')} />
        <Err k="email" />
      </div>
      <div>
        <label htmlFor={`${formId}-address`} className="label">Mesto / adresa isporuke *</label>
        <input id={`${formId}-address`} className="field" autoComplete="street-address" placeholder="npr. Leskovac, Bulevar oslobođenja 10" {...field('address')} />
        <Err k="address" />
      </div>
      <div>
        <label htmlFor={`${formId}-date`} className="label">Željeni termin <span className="font-normal text-ink-soft">(nije obavezno)</span></label>
        <input id={`${formId}-date`} className="field" placeholder="npr. početkom aprila" {...field('preferredDate')} />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${formId}-web`}>Ne popunjavati</label>
        <input id={`${formId}-web`} tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-navy"
            checked={contact.consent}
            onChange={(e) => setContact({ ...contact, consent: e.target.checked })}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? `${formId}-consent-e` : undefined}
          />
          <span>Saglasan/na sam da me kontaktirate u vezi sa ovom porudžbinom. *</span>
        </label>
        <Err k="consent" />
      </div>

      {submitError && (
        <div className="border-l-4 border-red-700 bg-red-50 p-4 text-red-900" role="alert">
          <p className="font-bold">Porudžbina nije poslata.</p>
          <p className="mt-1">
            {submitError} Pokušajte ponovo ili nas pozovite na{' '}
            <a href={business.phoneHref} className="font-bold underline">
              {business.phoneDisplay}
            </a>
            .
          </p>
        </div>
      )}

      <button type="submit" className="btn btn-primary hidden h-14 w-full text-lg lg:flex" disabled={sending}>
        {sending ? 'Šaljem porudžbinu…' : 'Pošalji porudžbinu'}
      </button>
      <p className="text-sm text-ink-soft">
        Slanje porudžbine nije obavezujuće. Javljamo se {business.responseTime} da potvrdimo detalje i cenu.
      </p>
    </form>
  )
}
