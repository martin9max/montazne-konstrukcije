/**
 * Spajanje, boje, dodaci i namene.
 */
export type Joining = 'sraf' | 'var'

export const joiningOptions: { id: Joining; name: string; text: string }[] = [
  {
    id: 'sraf',
    name: 'Na šrafljenje',
    text: 'Delovi dolaze pripremljeni i izbušeni, samo se spoje šrafovima. Lakši prevoz, a konstrukcija može kasnije da se rastavi i premesti.',
  },
  {
    id: 'var',
    name: 'Zavareno',
    text: 'Spojevi su zavareni. Konstrukcija je jedna kruta celina, za trajne objekte.',
  },
]

export interface ColorOption {
  id: string
  name: string
  hex: string
  ral?: string
}

/** Standardna paleta. [POTVRDITI paletu sa klijentom] – podrazumevana je crna 3u1. */
export const colorOptions: ColorOption[] = [
  { id: 'crna', name: 'Crna 3u1', hex: '#16171a', ral: 'RAL 9005' },
  { id: 'antracit', name: 'Antracit', hex: '#383e42', ral: 'RAL 7016' },
  { id: 'siva', name: 'Svetlosiva', hex: '#a5a8a6', ral: 'RAL 7035' },
  { id: 'bela', name: 'Bela', hex: '#ecece7', ral: 'RAL 9010' },
  { id: 'braon', name: 'Braon', hex: '#4a3328', ral: 'RAL 8017' },
]

export const CUSTOM_COLOR_ID = 'ral'
export const DEFAULT_COLOR_ID = 'crna'
export const CUSTOM_COLOR_PREVIEW_HEX = '#55606b'

export const colorNote = 'Farba 3u1 (osnovna antikorozivna zaštita i završna boja u jednom).'

/** Granice za dodatke [POTVRDITI] */
export const extrasLimits = {
  galleryDepth: { min: 1, max: 8 },
  terraceLength: { min: 2, max: 40 },
  terraceDepth: { min: 1, max: 6 },
}

/**
 * Dodaci po tipu. [POTVRDITI] da li postoje još dodaci
 * (npr. ojačanja, krovni nosači, otvori za vrata/prozore).
 */
export const extrasByType = {
  aframe: { gallery: true, terrace: true },
  kontejnerska: { gallery: false, terrace: true },
  skica: { gallery: false, terrace: false },
} as const

export const purposes = [
  { id: 'vikendica', name: 'Vikendica' },
  { id: 'stanovanje', name: 'Stanovanje' },
  { id: 'apartman', name: 'Apartman' },
  { id: 'kancelarija', name: 'Kancelarija' },
  { id: 'radionica', name: 'Radionica' },
  { id: 'skladiste', name: 'Skladište' },
  { id: 'ostalo', name: 'Ostalo' },
] as const

export type PurposeId = (typeof purposes)[number]['id']

export const uploadLimits = {
  maxFiles: 3,
  maxFileMB: 10,
  accept: ['image/jpeg', 'image/png', 'application/pdf'],
  acceptAttr: '.jpg,.jpeg,.png,.pdf',
  /** Vercel funkcija prima najviše ~4,5 MB, pa slike smanjujemo u pregledaču. */
  maxTotalUploadMB: 4,
}
