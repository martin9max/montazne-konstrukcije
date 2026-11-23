import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, m } from 'framer-motion'
import { products as allProducts } from '../../config/products'
import { Photo } from '../ui/Photo'
import { SectionHeading } from '../ui/SectionHeading'
import { ArrowLeft, ArrowRight, CheckIcon } from '../ui/Icons'

// na početnoj samo konstrukcije (bez „Imam svoju skicu“)
const products = allProducts.filter((p) => p.id !== 'skica')

/** Zajedničko za sve konstrukcije */
const common = ['Na šrafljenje ili zavarena', 'Farba 3u1, crna ili po želji', 'Rok izrade 15–20 radnih dana', 'Prevoz i montaža na Vašoj lokaciji']

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -60 }),
}

/** Konstrukcije jedna po jedna, sa strelicama, tačkama i prevlačenjem */
export function Products() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1])
  const total = products.length
  const p = products[index]

  const go = useCallback((d: number) => setState(([i]) => [(i + d + total) % total, d]), [total])
  const goTo = (i: number) => setState(([cur]) => [i, i >= cur ? 1 : -1])

  return (
    <section id="konstrukcije" className="scroll-mt-24 py-16 md:py-24" aria-labelledby="konstrukcije-title">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="konstrukcije-title" eyebrow="Šta pravimo" title="Konstrukcije" />
          <div className="mb-10 hidden items-center gap-3 md:mb-14 md:flex">
            <Counter index={index} total={total} />
            <ArrowButtons onPrev={() => go(-1)} onNext={() => go(1)} />
          </div>
        </div>
        <p className="-mt-6 mb-10 max-w-2xl text-lg text-ink-soft" data-reveal>
          Pravimo čeličnu noseću konstrukciju, odnosno skelet objekta. Dobijate ofarbanu konstrukciju koju posle zatvarate
          panelima, drvetom ili limom.
        </p>

        <div
          className="relative overflow-hidden border border-line bg-white"
          role="region"
          aria-roledescription="slajder"
          aria-label="Konstrukcije"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(1)
            if (e.key === 'ArrowLeft') go(-1)
          }}
          data-reveal
        >
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <m.article
              key={p.id}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60 || info.velocity.x < -400) go(1)
                else if (info.offset.x > 60 || info.velocity.x > 400) go(-1)
              }}
              className="grid cursor-grab touch-pan-y items-center active:cursor-grabbing lg:grid-cols-2"
              aria-roledescription="slajd"
              aria-label={`${index + 1} od ${total}: ${p.name}`}
            >
              <div className="pointer-events-none relative aspect-[4/3] self-center overflow-hidden bg-paper lg:my-6 lg:ml-6">
                <div className="absolute inset-0 [&_img]:transition-transform" style={{ ['--pos' as string]: p.imagePosition ?? '50% 50%' }}>
                  <Photo
                    name={p.image}
                    alt={`${p.name}, realizovan projekat`}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="[object-position:var(--pos)]"
                  />
                </div>
                {index === 0 && (
                  <span className="eyebrow absolute left-0 top-0 bg-navy px-4 py-2 text-[0.7rem] text-white">Najtraženije</span>
                )}
              </div>

              <div className="flex flex-col p-6 md:p-10">
                <p className="eyebrow text-navy/60">
                  {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </p>
                <h3 className="display mt-3 text-3xl md:text-[2.4rem]">{p.name}</h3>
                <p className="mt-3 text-lg text-ink-soft">{p.description}</p>

                {p.highlights && (
                  <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {[...p.highlights, ...common].map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-[0.95rem] font-semibold">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                {p.uses && (
                  <p className="mt-6 text-sm text-ink-soft">
                    <span className="eyebrow mr-2 text-[0.68rem] text-navy/60">Namena</span>
                    {p.uses.join(' · ')}
                  </p>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-auto lg:pt-8">
                  <Link to={`/konfigurator?tip=${p.id}`} className="btn btn-primary h-14 text-lg" draggable={false}>
                    Zatražite ponudu <ArrowRight />
                  </Link>
                </div>
              </div>
            </m.article>
          </AnimatePresence>
        </div>

        {/* tačke + strelice */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex gap-2" role="tablist" aria-label="Izbor konstrukcije">
            {products.map((x, i) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={x.name}
                onClick={() => goTo(i)}
                className="flex h-11 items-center"
              >
                <span className={`block h-[3px] transition-all duration-300 ${i === index ? 'w-10 bg-navy' : 'w-5 bg-navy/25'}`} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <ArrowButtons onPrev={() => go(-1)} onNext={() => go(1)} />
          </div>
          <button type="button" onClick={() => go(1)} className="hidden items-center gap-2 font-bold text-navy hover:underline md:flex">
            Sledeća: {products[(index + 1) % total].shortName} <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  )
}

function Counter({ index, total }: { index: number; total: number }) {
  return (
    <span className="mr-2 font-mono text-sm text-ink-soft" aria-hidden="true">
      {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
    </span>
  )
}

function ArrowButtons({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <button type="button" onClick={onPrev} aria-label="Prethodna konstrukcija" className="flex h-12 w-12 items-center justify-center border-2 border-steel text-steel transition-colors hover:bg-steel hover:text-white">
        <ArrowLeft />
      </button>
      <button type="button" onClick={onNext} aria-label="Sledeća konstrukcija" className="flex h-12 w-12 items-center justify-center bg-navy text-white transition-colors hover:bg-navy-700">
        <ArrowRight />
      </button>
    </>
  )
}
