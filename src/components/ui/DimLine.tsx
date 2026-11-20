/** Horizontalna kota (strelica sa merom) kao na tehničkom crtežu */
export function DimLine({
  label,
  light = false,
  className = '',
}: {
  label?: string
  light?: boolean
  className?: string
}) {
  const c = light ? 'text-white/70' : 'text-navy/60'
  return (
    <div className={`dimline relative flex items-center ${c} ${className}`} aria-hidden="true">
      <span className="h-3 w-px bg-current" />
      <span className="relative h-px flex-1 bg-current">
        <span className="absolute left-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[4px] border-r-[8px] border-y-transparent border-r-current" />
        <span className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[4px] border-l-[8px] border-y-transparent border-l-current" />
      </span>
      {label && (
        <span className={`absolute left-1/2 -translate-x-1/2 px-2 text-[0.7rem] font-bold tracking-widest ${light ? 'bg-navy' : 'bg-paper'}`}>
          {label}
        </span>
      )}
      <span className="h-3 w-px bg-current" />
    </div>
  )
}
