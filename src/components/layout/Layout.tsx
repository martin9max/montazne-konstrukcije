import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { scrollToTarget } from '../../lib/smoothScroll'

export function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const t = setTimeout(() => scrollToTarget(`#${CSS.escape(id)}`), 60)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
    scrollToTarget(0)
  }, [pathname, hash])

  return (
    <>
      <a href="#sadrzaj" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-white focus:p-3">
        Preskoči na sadržaj
      </a>
      <Navbar />
      <main id="sadrzaj">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
