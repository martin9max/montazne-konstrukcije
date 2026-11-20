import { useEffect } from 'react'
import { business } from '../../config/business'

/** Postavlja naslov, opis i canonical po stranici */
export function Seo({ title, description, path = '/', noindex = false }: { title: string; description: string; path?: string; noindex?: boolean }) {
  useEffect(() => {
    document.title = title
    const set = (sel: string, attr: string, val: string) => {
      let el = document.head.querySelector(sel) as HTMLElement | null
      if (!el) {
        el = document.createElement(sel.startsWith('link') ? 'link' : 'meta')
        const m = sel.match(/\[(\w+)="([^"]+)"\]/)
        if (m) el.setAttribute(m[1], m[2])
        document.head.appendChild(el)
      }
      el.setAttribute(attr, val)
    }
    set('meta[name="description"]', 'content', description)
    set('meta[property="og:title"]', 'content', title)
    set('meta[property="og:description"]', 'content', description)
    set('link[rel="canonical"]', 'href', business.siteUrl + path)
    set('meta[name="robots"]', 'content', noindex ? 'noindex' : 'index,follow')
  }, [title, description, path, noindex])
  return null
}
