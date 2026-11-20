import { business } from '../../config/business'

/** Potpis brenda: „ČVRSTA • PRECIZNA • PO MERI“ sa tankim linijama */
export function BrandSeparator({ light = false, className = '' }: { light?: boolean; className?: string }) {
  const c = light ? 'text-white/90' : 'text-navy'
  const line = light ? 'bg-white/60' : 'bg-navy/40'
  return (
    <div className={`flex items-center gap-4 ${c} ${className}`}>
      <span className={`h-px flex-1 max-w-16 ${line}`} />
      <p className="eyebrow whitespace-nowrap text-[0.7rem] sm:text-xs">
        {business.tagline.map((t, i) => (
          <span key={t}>
            {i > 0 && <span className="mx-2 sm:mx-3" aria-hidden="true">•</span>}
            {t}
          </span>
        ))}
      </p>
      <span className={`h-px flex-1 max-w-16 ${line}`} />
    </div>
  )
}
