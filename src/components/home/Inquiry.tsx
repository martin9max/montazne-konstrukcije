import { InquiryForm } from '../inquiry/InquiryForm'

/** Sekcija na početnoj: isti formular za upit kao na /konfigurator */
export function Inquiry() {
  return (
    <section id="ponuda" className="scroll-mt-20 border-y border-line bg-paper" aria-label="Zatražite ponudu">
      <InquiryForm titleAs="h2" />
    </section>
  )
}
