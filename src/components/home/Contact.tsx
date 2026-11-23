import { business } from '../../config/business'
import { SectionHeading } from '../ui/SectionHeading'
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon } from '../ui/Icons'

/** Kontakt: samo podaci (upit se šalje kroz sekciju „Zatražite ponudu“) */
export function Contact() {
  const location = business.address ?? business.place
  const items = [
    {
      icon: <MailIcon className="h-6 w-6" />,
      label: 'Email',
      // prelom dozvoljen samo ispred @, da se adresa ne lomi usred reči
      value: (
        <>
          {business.email.split('@')[0]}
          <wbr />@{business.email.split('@')[1]}
        </>
      ),
      href: `mailto:${business.email}`,
    },
    {
      icon: <InstagramIcon className="h-6 w-6" />,
      label: 'Instagram',
      value: business.instagram.handle,
      href: business.instagram.url,
      external: true,
    },
    {
      icon: <PinIcon className="h-6 w-6" />,
      label: 'Lokacija',
      value: business.serviceArea ? `${location} · isporuka: ${business.serviceArea}` : location,
      href: business.mapUrl ?? undefined,
      external: true,
    },
  ]

  return (
    <section id="kontakt" className="scroll-mt-24 bg-steel py-20 text-white md:py-28" aria-labelledby="kontakt-title">
      <div className="container-x">
        <SectionHeading id="kontakt-title" eyebrow="Javite se" title="Kontakt" light />

        <a href={business.phoneHref} className="group inline-block" data-reveal>
          <span className="eyebrow text-white/50">Telefon</span>
          <span className="display mt-2 flex items-center gap-4 text-4xl group-hover:underline sm:text-6xl">
            <PhoneIcon className="h-9 w-9 shrink-0" />
            {business.phoneDisplay}
          </span>
        </a>

        <ul className="mt-12 grid gap-px border border-white/15 bg-white/15 md:grid-cols-3" data-reveal>
          {items.map((it) => {
            const inner = (
              <>
                <span className="text-white/60">{it.icon}</span>
                <span className="eyebrow mt-4 block text-white/50">{it.label}</span>
                <span className="mt-1 block text-base font-semibold md:text-[1.05rem]">{it.value}</span>
              </>
            )
            return (
              <li key={it.label} className="bg-steel">
                {it.href ? (
                  <a
                    href={it.href}
                    {...(it.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="block h-full p-6 transition-colors hover:bg-white/5 md:p-8"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="h-full p-6 md:p-8">{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
