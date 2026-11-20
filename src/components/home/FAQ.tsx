import { useId, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { faq } from '../../config/faq'
import { SectionHeading } from '../ui/SectionHeading'
import { PlusIcon } from '../ui/Icons'

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  const uid = useId()
  return (
    <section className="py-20 md:py-28" aria-labelledby="faq-title">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <SectionHeading id="faq-title" eyebrow="Pitanja" title="Česta pitanja" />
        <div className="border-t-2 border-steel" data-reveal>
          {faq.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-bold md:text-xl"
                    aria-expanded={isOpen}
                    aria-controls={`${uid}-${i}`}
                    id={`${uid}-b${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {f.q}
                    <PlusIcon className={`h-6 w-6 shrink-0 text-navy transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={`${uid}-${i}`}
                      role="region"
                      aria-labelledby={`${uid}-b${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-lg text-ink-soft">{f.a}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
