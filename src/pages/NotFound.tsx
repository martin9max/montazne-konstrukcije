import { Link } from 'react-router-dom'
import { Seo } from '../components/ui/Seo'
import { DimLine } from '../components/ui/DimLine'
import { BrandSeparator } from '../components/ui/Separator'

export function NotFound() {
  return (
    <section className="blueprint flex min-h-[75vh] items-center py-20">
      <Seo title="Stranica nije pronađena | Montažne Konstrukcije" description="Stranica ne postoji." noindex />
      <div className="container-x text-center">
        <svg viewBox="0 0 220 120" className="mx-auto h-28 w-auto text-navy" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20 100 L70 30 L120 100 Z" />
          <path d="M70 30 L160 18" strokeDasharray="6 6" />
          <path d="M120 100 L150 96" strokeDasharray="6 6" />
          <path d="M45 65 H95" strokeOpacity=".5" />
        </svg>
        <p className="eyebrow mt-6 text-navy/60">Greška 404</p>
        <h1 className="display mt-3 text-4xl md:text-6xl">Ova stranica ne postoji</h1>
        <DimLine label="? m" className="mx-auto mt-8 max-w-xs" />
        <p className="mx-auto mt-8 max-w-md text-lg text-ink-soft">Možda je link pogrešan. Vratite se na početnu ili sklopite svoju konstrukciju.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn btn-outline-dark h-14">Početna</Link>
          <Link to="/konfigurator" className="btn btn-primary h-14">Zatražite ponudu</Link>
        </div>
        <BrandSeparator className="mt-14 justify-center" />
      </div>
    </section>
  )
}
