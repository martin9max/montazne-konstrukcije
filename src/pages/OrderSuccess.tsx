import { Link, useLocation } from 'react-router-dom'
import { m } from 'framer-motion'
import { business } from '../config/business'
import { Seo } from '../components/ui/Seo'
import { BrandSeparator } from '../components/ui/Separator'
import { CheckIcon, PhoneIcon } from '../components/ui/Icons'

interface SuccessData {
  orderId: string
  rows: { label: string; value: string }[]
  phone: string
}

export default function OrderSuccess() {
  const loc = useLocation()
  let data = loc.state as SuccessData | null
  if (!data) {
    try {
      data = JSON.parse(sessionStorage.getItem('mk-last-order') ?? 'null')
    } catch {
      data = null
    }
  }

  return (
    <section className="blueprint min-h-[80vh] py-14 md:py-20">
      <Seo title="Porudžbina je poslata | Montažne Konstrukcije" description="Hvala na porudžbini." noindex />
      <div className="container-x max-w-2xl">
        <m.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex h-16 w-16 items-center justify-center bg-navy text-white"
        >
          <CheckIcon className="h-9 w-9" />
        </m.div>
        <h1 className="display mt-6 text-4xl md:text-6xl">Porudžbina je poslata</h1>
        {data?.orderId && (
          <p className="mt-4 text-lg">
            Broj porudžbine: <strong className="font-mono text-xl tracking-wide text-navy">{data.orderId}</strong>
          </p>
        )}
        <p className="mt-4 text-xl font-semibold">Javljamo se u roku od 24h na broj koji ste ostavili{data?.phone ? ` (${data.phone})` : ''}.</p>

        {data?.rows && (
          <dl className="mt-8 border-2 border-steel bg-white px-5">
            {data.rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
                <dt className="text-ink-soft">{r.label}</dt>
                <dd className="text-right font-semibold">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={business.phoneHref} className="btn btn-primary h-14 text-lg">
            <PhoneIcon /> Pozovi {business.phoneDisplay}
          </a>
          <Link to="/" className="btn btn-outline-dark h-14">
            Nazad na početnu
          </Link>
        </div>
        <BrandSeparator className="mt-14" />
      </div>
    </section>
  )
}
