import { Link } from 'react-router-dom'
import { StructurePreview } from '../configurator/preview/StructurePreview'
import { ArrowRight } from '../ui/Icons'

export function ConfiguratorTeaser() {
  return (
    <section className="border-y border-line bg-white py-16 md:py-20" aria-labelledby="teaser-title">
      <div className="container-x grid items-center gap-10 md:grid-cols-2">
        <div className="blueprint order-2 md:order-1" data-reveal>
          <StructurePreview
            animated={false}
            title="Primer konstrukcije u konfiguratoru"
            className="h-auto w-full"
            input={{ type: 'kontejnerska', length: 6, width: 3, height: 2.5, gallery: false, galleryDepth: 0, terrace: true, terraceLength: 6, terraceDepth: 2, color: '#16171a' }}
          />
        </div>
        <div className="order-1 md:order-2" data-reveal>
          <p className="eyebrow mb-4 text-navy/70">Konfigurator</p>
          <h2 id="teaser-title" className="display text-4xl md:text-5xl">Sklopite je sami</h2>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Izaberite tip, dimenzije, spajanje, boju i dodatke. Konstrukciju vidite odmah, sa merama. Pošaljete
            porudžbinu, a mi se javljamo da potvrdimo detalje i cenu.
          </p>
          <Link to="/konfigurator" className="btn btn-primary mt-8 h-14 text-lg">
            Napravi svoju konstrukciju <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  )
}
