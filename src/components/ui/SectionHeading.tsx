export function SectionHeading({
  eyebrow,
  title,
  light = false,
  id,
}: {
  eyebrow: string
  title: string
  light?: boolean
  id?: string
}) {
  return (
    <div className="mb-10 md:mb-14" data-reveal>
      <p className={`eyebrow mb-4 flex items-center gap-3 ${light ? 'text-white/70' : 'text-navy/70'}`}>
        <span className={`h-px w-10 ${light ? 'bg-white/60' : 'bg-navy/50'}`} />
        {eyebrow}
      </p>
      <h2 id={id} className={`display text-[2.1rem] sm:text-5xl md:text-6xl ${light ? 'text-white' : 'text-steel'}`}>
        {title}
      </h2>
    </div>
  )
}
