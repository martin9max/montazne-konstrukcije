import { useSectionLink } from '../layout/useSectionLink'
import { m } from 'framer-motion'
import { business } from '../../config/business'
import { BrandSeparator } from '../ui/Separator'
import { ArrowRight, PhoneIcon } from '../ui/Icons'
import { Photo } from '../ui/Photo'
import { HeroAssembly } from './HeroAssembly'

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } }),
}

export function Hero() {
  const go = useSectionLink()
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white" aria-labelledby="hero-title">
      {/* fotografija u pozadini (kad stigne), prigušena teget slojem */}
      <div className="absolute inset-0 -z-10 opacity-30" aria-hidden="true">
        <Photo name="aframe-6x5x5-galerija-2" alt="" priority dark sizes="100vw" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/70 via-navy/85 to-navy" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgb(255 255 255 / .05) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, #000 40%, transparent 80%)',
        }}
        aria-hidden="true"
      />

      <div className="container-x flex flex-col items-center pt-12 text-center md:pt-14">
        <m.p className="eyebrow mb-6 text-white/70" variants={rise} initial="hidden" animate="show" custom={0}>
          Isporuka i montaža širom Srbije
        </m.p>
        <m.h1
          id="hero-title"
          className="display max-w-6xl text-[2.3rem] leading-[0.98] min-[400px]:text-[2.6rem] sm:text-6xl lg:text-[4.4rem] xl:text-[5rem]"
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
        >
          Montažne metalne konstrukcije
          <span className="mt-3 block font-sans text-base font-bold tracking-[0.35em] text-white/75 md:mt-4 md:text-xl">
            <span className="sr-only"> </span>
            {business.place}
          </span>
        </m.h1>
        <m.div variants={rise} initial="hidden" animate="show" custom={2} className="w-full">
          <BrandSeparator light className="mx-auto mt-7 max-w-lg justify-center" />
        </m.div>
        <m.p className="mt-7 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl" variants={rise} initial="hidden" animate="show" custom={3}>
          Konstrukcije po Vašim merama, na šrafljenje ili zavarene. Rok izrade 15–20 radnih dana.
        </m.p>
        <m.div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row" variants={rise} initial="hidden" animate="show" custom={4}>
          <a href="#ponuda" onClick={go('ponuda')} className="btn btn-light h-14 text-lg">
            Zatražite ponudu <ArrowRight />
          </a>
          <a href={business.phoneHref} className="btn btn-outline h-14 text-lg text-white">
            <PhoneIcon /> Pozovi {business.phoneDisplay}
          </a>
        </m.div>

        <HeroAssembly className="mt-12 w-full max-w-[52rem] md:mt-16" />
        <div className="h-10 md:h-16" aria-hidden="true" />
      </div>
    </section>
  )
}
