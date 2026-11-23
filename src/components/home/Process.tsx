import { SectionHeading } from '../ui/SectionHeading'

const steps = [
  { t: 'Pošaljite upit', d: 'Na sajtu za minut, ili nas pozovite.' },
  { t: 'Javljamo se', d: 'Potvrđujemo detalje i cenu, u roku od 24h.' },
  { t: 'Izrada', d: '15–20 radnih dana. Za veće konstrukcije do 30.' },
  { t: 'Prevoz i montaža', d: 'Dovozimo i montiramo na Vašoj lokaciji.' },
]

export function Process() {
  return (
    <section id="kako-radimo" className="scroll-mt-24 bg-navy py-20 text-white md:py-28" aria-labelledby="kako-title">
      <div className="container-x">
        <SectionHeading id="kako-title" eyebrow="Postupak" title="Kako radimo" light />
        <ol className="grid gap-0 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.t} className="relative border-t border-white/20 py-8 md:border-l md:border-t-0 md:px-6 md:py-2 md:first:border-l-0 md:first:pl-0" data-reveal>
              <span className="display block text-6xl text-white/25 md:text-7xl" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-xl font-bold">{s.t}</h3>
              <p className="mt-2 text-white/75">{s.d}</p>
              {i < steps.length - 1 && (
                <div className="dimline mt-6 hidden items-center text-white/40 md:flex" aria-hidden="true">
                  <span className="h-3 w-px bg-current" />
                  <span className="h-px flex-1 bg-current" />
                  <span className="h-0 w-0 border-y-[4px] border-l-[8px] border-y-transparent border-l-current" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
