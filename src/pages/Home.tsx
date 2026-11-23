import { useRef } from 'react'
import { Hero } from '../components/home/Hero'
import { Products } from '../components/home/Products'
import { Inquiry } from '../components/home/Inquiry'
import { Process } from '../components/home/Process'
import { Projects } from '../components/home/Projects'
import { FAQ } from '../components/home/FAQ'
import { Contact } from '../components/home/Contact'
import { Seo } from '../components/ui/Seo'
import { business } from '../config/business'
import { useScrollReveal } from '../lib/useScrollReveal'

export function Home() {
  const ref = useRef<HTMLDivElement>(null)
  useScrollReveal(ref)
  return (
    <div ref={ref}>
      <Seo
        title={`Montažne metalne konstrukcije ${business.place} | Po meri, prevoz i montaža`}
        description="Montažne metalne konstrukcije iz Boranjca, po Vašim merama: A-frame vikendice, kontejnerske i veće konstrukcije. Na šrafljenje ili zavarene, farbanje 3u1, prevoz i montaža širom Srbije. Rok izrade 15–20 radnih dana."
        path="/"
      />
      <Hero />
      <Products />
      <Inquiry />
      <Process />
      <Projects />
      <FAQ />
      <Contact />
    </div>
  )
}
