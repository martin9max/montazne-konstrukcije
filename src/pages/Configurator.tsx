import { business } from '../config/business'
import { Seo } from '../components/ui/Seo'
import { InquiryForm } from '../components/inquiry/InquiryForm'

/** Posebna stranica za upit (isti formular kao sekcija na početnoj) */
export default function Configurator() {
  return (
    <div className="bg-paper">
      <Seo
        title={`Zatražite ponudu | Montažne Konstrukcije ${business.place}`}
        description="Izaberite konstrukciju i dimenzije, ostavite broj telefona i javljamo se u roku od 24h sa cenom."
        path="/konfigurator"
      />
      <InquiryForm syncUrl titleAs="h1" />
    </div>
  )
}
