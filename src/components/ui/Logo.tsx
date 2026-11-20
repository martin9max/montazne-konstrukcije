/**
 * Logo „Montažne Konstrukcije“ (vektorska verzija prema originalu klijenta).
 * LogoMark = krug sa konstrukcijom (navbar, favicon), LogoFull = ceo znak sa tekstom.
 */
const SILVER = '#E4E7EC'
const NAVY = '#0F1C33'

function Frame({ main = 9, minor = 6 }: { main?: number; minor?: number }) {
  // tačke u koordinatama 0..1000
  const N = [582, 268], Nb = [582, 538]
  const L = [134, 427], Lb = [137, 548]
  const R = [871, 432], Rb = [867, 548]
  const B = [488, 500], Bb = [488, 535]
  const lerp = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
  const l = (a: number[], b: number[]) => `M${a[0].toFixed(0)} ${a[1].toFixed(0)}L${b[0].toFixed(0)} ${b[1].toFixed(0)}`
  const mNL = lerp(N, L, 0.5), mNR = lerp(N, R, 0.5), mLB = lerp(L, B, 0.5), mRB = lerp(R, B, 0.5)
  const outer = [l(L, N), l(N, R), l(L, Lb), l(N, Nb), l(R, Rb), l(mNL, [mNL[0], 542]), l(mNR, [mNR[0], 545])].join('')
  const inner = [
    l(L, B), l(B, R), l(B, Bb), l(mLB, [mLB[0], 538]),
    l(mNL, mRB), l(mNR, mLB),
    l(lerp(N, L, 0.25), lerp(R, B, 0.25)), l(lerp(N, R, 0.75), lerp(L, B, 0.75)),
  ].join('')
  return (
    <g fill="none" stroke={SILVER} strokeLinecap="square">
      <path d={inner} strokeWidth={minor} strokeOpacity={0.8} />
      <path d={outer} strokeWidth={main} />
      <path d="M70 563 Q500 541 930 563 Q500 551 70 563Z" fill={SILVER} stroke="none" />
    </g>
  )
}

export function LogoMark({ className = 'h-11 w-11' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true">
      <circle cx="500" cy="500" r="500" fill={NAVY} />
      <circle cx="500" cy="500" r="455" fill="none" stroke={SILVER} strokeWidth="26" />
      <g transform="translate(500 510) scale(1.12) translate(-502 -415)">
        <Frame main={26} minor={16} />
      </g>
    </svg>
  )
}

export function LogoFull({ className = 'h-40 w-40', title = 'Montažne Konstrukcije, Boranjac, 065 864 7210' }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 1000 1000" className={className} role={title ? 'img' : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <defs>
        <path id="lg-arc1" d="M157 503 A343 343 0 0 0 843 503" />
        <path id="lg-arc2" d="M88 503 A412 412 0 0 0 912 503" />
      </defs>
      <circle cx="500" cy="500" r="500" fill={NAVY} />
      <circle cx="500" cy="503" r="472" fill="none" stroke={SILVER} strokeWidth="12" />
      <Frame />
      <g fill="#fff" fontFamily="Montserrat, Manrope, Arial, sans-serif" textAnchor="middle">
        <text x="500" y="713" fontSize="112" fontWeight="800" textLength="770" lengthAdjust="spacingAndGlyphs">
          MONTAŽNE
        </text>
        <text x="500" y="755" fontSize="44" fontWeight="500" letterSpacing="14" fill={SILVER}>
          KONSTRUKCIJE
        </text>
        <text fontSize="52" fontWeight="800" letterSpacing="6">
          <textPath href="#lg-arc1" startOffset="50%">BORANJAC</textPath>
        </text>
        <text fontSize="50" fontWeight="700" letterSpacing="5">
          <textPath href="#lg-arc2" startOffset="50%">065 864 7210</textPath>
        </text>
      </g>
      <g stroke={SILVER} strokeWidth="5" strokeLinecap="round">
        <path d="M148 740 H228 M772 740 H852" />
        <path d="M216 800 L281 851 M784 800 L719 851" />
      </g>
    </svg>
  )
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoFull className="h-14 w-14 shrink-0 md:h-16 md:w-16" title="" />
      <span className={`leading-none ${light ? 'text-white' : 'text-navy'}`}>
        <span className="block font-[Montserrat,Manrope,sans-serif] text-[1.05rem] font-extrabold tracking-[0.02em]">MONTAŽNE</span>
        <span className={`mt-1 block font-[Montserrat,Manrope,sans-serif] text-[0.6rem] font-medium tracking-[0.32em] ${light ? 'text-white/75' : 'text-navy/75'}`}>
          KONSTRUKCIJE
        </span>
      </span>
    </span>
  )
}
