import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToTarget } from '../../lib/smoothScroll'

/** Klik na link ka sekciji početne strane: skrol ako smo na početnoj, inače navigacija */
export function useSectionLink() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === '/') {
      scrollToTarget(`#${id}`)
      history.replaceState(null, '', `#${id}`)
    } else {
      navigate(`/#${id}`)
    }
  }
}
