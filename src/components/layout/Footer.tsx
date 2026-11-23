import { Link } from 'react-router-dom'
import { business } from '../../config/business'
import { LogoFull } from '../ui/Logo'
import { BrandSeparator } from '../ui/Separator'
import { navLinks } from './navLinks'
import { useSectionLink } from './useSectionLink'

export function Footer() {
  const go = useSectionLink()
  const year = new Date().getFullYear()
  return (
    <footer className="bg-navy-900 pb-12 pt-16 text-white">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <LogoFull className="h-36 w-36 md:h-44 md:w-44" />
            <p className="mt-5 max-w-sm text-white/70">
              Metalne noseće konstrukcije po Vašim merama. Na šrafljenje ili zavarene, farbane bojom 3u1.
            </p>
          </div>
          <nav aria-label="Linkovi u podnožju">
            <p className="eyebrow mb-4 text-white/50">Sajt</p>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a href={`/#${l.id}`} onClick={go(l.id)} className="text-white/85 hover:text-white hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/konfigurator" className="text-white/85 hover:text-white hover:underline">
                  Konfigurator
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="eyebrow mb-4 text-white/50">Kontakt</p>
            <ul className="space-y-2">
              <li>
                <a href={business.phoneHref} className="text-xl font-bold hover:underline">
                  {business.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="break-all text-white/85 hover:underline">
                  {business.email}
                </a>
              </li>
              <li>
                <a href={business.instagram.url} target="_blank" rel="noopener noreferrer" className="text-white/85 hover:underline">
                  Instagram {business.instagram.handle}
                </a>
              </li>
              {business.address && <li className="text-white/85">{business.address}</li>}
            </ul>
          </div>
        </div>
        <BrandSeparator light className="mt-14 justify-center" />
        <p className="mt-8 text-center text-sm text-white/50">
          © {year} {business.name}. Sva prava zadržana.
        </p>
      </div>
    </footer>
  )
}
