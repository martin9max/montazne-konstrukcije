import manifest from '../../config/image-manifest.json'

/**
 * Prikazuje WebP fotografiju sa srcset-om ako postoji u manifestu
 * (manifest pravi scripts/optimize_images.py), a u suprotnom neutralan placeholder
 * sa nazivom fajla koji treba da stigne od klijenta.
 */
const m = manifest as Record<string, { widths: number[]; w: number; h: number }>

export const hasPhoto = (name: string) => name in m

export function Photo({
  name,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  dark = false,
}: {
  name: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  dark?: boolean
}) {
  const entry = m[name]
  if (entry) {
    const base = import.meta.env.BASE_URL
    const srcSet = entry.widths.map((w) => `${base}images/${name}-${w}.webp ${w}w`).join(', ')
    const largest = entry.widths[entry.widths.length - 1]
    return (
      <img
        src={`${base}images/${name}-${largest}.webp`}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={entry.w}
        height={entry.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex h-full w-full items-end ${dark ? 'bg-navy-900' : 'hatch'} ${className}`}
      style={
        dark
          ? { backgroundImage: 'repeating-linear-gradient(135deg, rgb(255 255 255 / .04) 0 1px, transparent 1px 14px)' }
          : undefined
      }
    >
      <span className={`m-3 px-2 py-1 font-mono text-[11px] ${dark ? 'bg-white/10 text-white/60' : 'bg-white/70 text-navy/70'}`}>
        {name}.jpg
      </span>
    </div>
  )
}
