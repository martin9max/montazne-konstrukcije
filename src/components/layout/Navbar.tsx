import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, m } from 'framer-motion'
import { business } from '../../config/business'
import { Logo } from '../ui/Logo'
import { ArrowRight, CloseIcon, MenuIcon, PhoneIcon } from '../ui/Icons'
import { navLinks } from './navLinks'
import { useSectionLink } from './useSectionLink'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const go = useSectionLink()
  const isConfigurator = pathname.startsWith('/konfigurator')

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-paper/95 backdrop-blur-sm transition-colors ${
        scrolled ? 'border-line' : 'border-transparent'
      }`}
    >
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-4 md:h-20">
        <Link to="/" aria-label={`${business.name}, početna`} className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a
                  href={`/#${l.id}`}
                  onClick={go(l.id)}
                  className="text-[0.95rem] font-semibold text-steel/80 underline-offset-8 hover:text-navy hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <a
            href={business.phoneHref}
            className="hidden items-center gap-2 px-2 font-bold text-navy md:flex"
            aria-label={`Pozovite ${business.phoneDisplay}`}
          >
            <PhoneIcon />
            <span className="hidden xl:inline">{business.phoneDisplay}</span>
          </a>
          {!isConfigurator && (
            <a href="/#ponuda" onClick={go('ponuda')} className="btn btn-primary hidden min-h-11 px-5 text-[0.95rem] sm:inline-flex">
              Zatražite ponudu
            </a>
          )}
          <a
            href={business.phoneHref}
            className="flex h-11 w-11 items-center justify-center border-2 border-navy text-navy md:hidden"
            aria-label={`Pozovite ${business.phoneDisplay}`}
          >
            <PhoneIcon />
          </a>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center bg-navy text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Otvori meni"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* meni ide direktno u <body>: header ima backdrop-blur, pa bi „fixed“ bio vezan za header umesto za ekran */}
      {createPortal(
      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Meni"
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-navy text-white"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="container-x flex h-[4.5rem] items-center justify-between">
              <Logo light />
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center border-2 border-white/70"
                aria-label="Zatvori meni"
                onClick={() => setOpen(false)}
                autoFocus
              >
                <CloseIcon />
              </button>
            </div>
            <nav className="container-x mt-6 flex-1" aria-label="Mobilna navigacija">
              <ul className="border-t border-white/15">
                {navLinks.map((l, i) => (
                  <m.li
                    key={l.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                    className="border-b border-white/15"
                  >
                    <a
                      href={`/#${l.id}`}
                      onClick={(e) => {
                        setOpen(false)
                        go(l.id)(e)
                      }}
                      className="display flex items-center justify-between py-5 text-3xl"
                    >
                      {l.label}
                      <ArrowRight className="h-6 w-6 text-white/50" />
                    </a>
                  </m.li>
                ))}
              </ul>
            </nav>
            <div className="container-x space-y-3 pb-8">
              <a
                href="/#ponuda"
                className="btn btn-light w-full"
                onClick={(e) => {
                  setOpen(false)
                  go('ponuda')(e)
                }}
              >
                Zatražite ponudu
              </a>
              <a href={business.phoneHref} className="btn btn-outline w-full text-white">
                <PhoneIcon /> Pozovi {business.phoneDisplay}
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>,
        document.body,
      )}
    </header>
  )
}
