type P = { className?: string }
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
}

export const PhoneIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
  </svg>
)
export const ArrowRight = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)
export const ArrowLeft = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </svg>
)
export const CheckIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
)
export const PlusIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 4v16M4 12h16" />
  </svg>
)
export const CloseIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
)
export const MailIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M3 5h18v14H3zM3 6l9 7 9-7" />
  </svg>
)
export const InstagramIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </svg>
)
export const PinIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)
export const MenuIcon = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </svg>
)
export const UploadIcon = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 16V4M7 9l5-5 5 5M4 15v5h16v-5" />
  </svg>
)
export const ChevronDown = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)
