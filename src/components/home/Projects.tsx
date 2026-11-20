import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { projects } from '../../config/projects'
import { Photo } from '../ui/Photo'
import { SectionHeading } from '../ui/SectionHeading'
import { ArrowLeft, ArrowRight, CloseIcon } from '../ui/Icons'

export function Projects() {
  const [open, setOpen] = useState<number | null>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + projects.length) % projects.length)), [])

  useEffect(() => {
    if (open == null) {
      lastFocus.current?.focus()
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, step])

  return (
    <section id="projekti" className="scroll-mt-24 py-20 md:py-28" aria-labelledby="projekti-title">
      <div className="container-x">
        <SectionHeading id="projekti-title" eyebrow="Iz radionice" title="Realizovani projekti" />
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {projects.map((p, i) => (
            <li key={p.image + i} data-reveal>
              <button
                type="button"
                className="group relative block h-full w-full overflow-hidden text-left"
                onClick={(e) => {
                  lastFocus.current = e.currentTarget
                  setOpen(i)
                }}
                aria-label={`Otvori sliku: ${p.title}`}
              >
                <div className="aspect-square transition-transform duration-500 group-hover:scale-[1.03]">
                  <Photo name={p.image} alt={p.title} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
                </div>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-steel/85 to-transparent p-3 pt-10 text-sm font-bold leading-snug text-white md:p-4">
                  {p.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-ink-soft" data-reveal>
          Još projekata na Instagramu{' '}
          <a className="font-bold text-navy underline underline-offset-4" href="https://www.instagram.com/montazne_konstrukcije.rs/" target="_blank" rel="noopener noreferrer">
            @montazne_konstrukcije.rs
          </a>
        </p>
      </div>

      <AnimatePresence>
        {open != null && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={projects[open].title}
            className="fixed inset-0 z-50 flex flex-col bg-steel/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <div className="flex items-center justify-between p-4 text-white">
              <p className="font-bold">
                {projects[open].title}
                <span className="ml-3 font-normal text-white/50">
                  {open + 1}/{projects.length}
                </span>
              </p>
              <button type="button" className="flex h-11 w-11 items-center justify-center border border-white/40" aria-label="Zatvori" onClick={close} autoFocus>
                <CloseIcon />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-4 pb-6" onClick={(e) => e.stopPropagation()}>
              <m.div
                key={open}
                className="aspect-[4/3] max-h-full w-full max-w-5xl"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <Photo name={projects[open].image} alt={projects[open].title} sizes="100vw" dark />
              </m.div>
              <button type="button" aria-label="Prethodna slika" onClick={() => step(-1)} className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white text-navy">
                <ArrowLeft />
              </button>
              <button type="button" aria-label="Sledeća slika" onClick={() => step(1)} className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white text-navy">
                <ArrowRight />
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}
