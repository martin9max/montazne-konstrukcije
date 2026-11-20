import { useLocation } from 'react-router-dom'
import { business } from '../../config/business'
import { PhoneIcon } from '../ui/Icons'

/** Fiksno dugme za poziv na mobilnom (na konfiguratoru dno zauzima traka sa sažetkom) */
export function FloatingCall() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/konfigurator')) return null
  return (
    <a
      href={business.phoneHref}
      aria-label={`Pozovite ${business.phoneDisplay}`}
      className="fixed bottom-4 right-4 z-30 flex items-center gap-2 bg-navy px-5 py-4 font-bold text-white shadow-[0_10px_30px_-10px_rgb(12_22_40/.7)] md:hidden"
    >
      <PhoneIcon className="h-5 w-5" />
      Pozovi
    </a>
  )
}
