import type { ProductType } from '../../config/products'

export function TypeIcon({ type, className = 'h-14 w-16' }: { type: ProductType; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true">
      <g {...common}>
        {type === 'aframe' && (
          <>
            <path d="M6 48 L20 10 L34 48 Z" />
            <path d="M20 10 L46 4 L60 42 L34 48" />
            <path d="M27 7 L40 45 M13 29 H27" strokeOpacity=".5" />
          </>
        )}
        {type === 'kontejnerska' && (
          <>
            <path d="M4 26 L4 46 L36 52 L60 42 L60 22 L28 16 Z" />
            <path d="M4 26 L36 32 L60 22 M36 32 L36 52" />
            <path d="M20 29 L20 49 M14 23 L44 28" strokeOpacity=".5" />
          </>
        )}
        {type === 'skica' && (
          <>
            <path d="M8 6 H46 L56 16 V50 H8 Z" />
            <path d="M46 6 V16 H56" />
            <path d="M16 40 L26 20 L36 40 Z M16 44 H36" strokeOpacity=".6" />
            <path d="M40 28 L50 38" />
          </>
        )}
      </g>
    </svg>
  )
}
