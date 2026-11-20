/**
 * Tipovi konstrukcija, preseti dimenzija i granice.
 * Granice (min/max) su [POTVRDITI] sa klijentom.
 */
export type ProductType = 'aframe' | 'kontejnerska' | 'skica'
export type BuildType = Exclude<ProductType, 'skica'>

export interface Range { min: number; max: number }

export interface DimPreset {
  id: string
  label: string
  length: number
  width: number
  height: number
}

export interface Product {
  id: ProductType
  name: string
  shortName: string
  description: string
  /** primeri dimenzija koje su već radili (za kartice na početnoj) */
  examples: string[]
  /** naziv fajla fotografije (bez ekstenzije), vidi scripts/optimize_images.py */
  image: string
  /** koji deo fotografije je u kadru (CSS object-position) */
  imagePosition?: string
  /** kratke karakteristike za karticu na početnoj */
  highlights?: string[]
  /** za šta se najčešće koristi */
  uses?: string[]
  labels: { length: string; width: string; height: string }
  limits?: { length: Range; width: Range; height: Range }
  presets: DimPreset[]
  defaults?: { length: number; width: number; height: number }
}

export const products: Product[] = [
  {
    id: 'aframe',
    name: 'A-frame vikendica',
    shortName: 'A-frame',
    description:
      'Najtraženija konstrukcija. Trouglasti ram, moguća galerija. Idealno za vikendicu ili apartman.',
    examples: ['5×4 m', '8×6 m', '6×5×5 m sa galerijom od 4 m'],
    image: 'aframe-6x5x5-galerija-1',
    imagePosition: '50% 30%',
    highlights: ['Trouglasti ram, krov i zid u jednom', 'Moguća galerija u potkrovlju', 'Moguća terasa ispred ulaza'],
    uses: ['Vikendica', 'Apartman', 'Stanovanje'],
    labels: { length: 'Dužina', width: 'Širina osnove', height: 'Visina slemena' },
    limits: {
      length: { min: 3, max: 15 },
      width: { min: 3, max: 10 },
      height: { min: 3, max: 9 },
    },
    presets: [
      { id: '5x4', label: '5×4', length: 5, width: 4, height: 4 },
      { id: '6x5', label: '6×5', length: 6, width: 5, height: 5 },
      { id: '8x6', label: '8×6', length: 8, width: 6, height: 6 },
    ],
  },
  {
    id: 'kontejnerska',
    name: 'Kontejnerska / pravougaona',
    shortName: 'Kontejnerska',
    description:
      'Pravougaoni ram za kontejner, kancelariju, radionicu ili stanovanje. Može da se spaja u veće celine.',
    examples: ['6×2,4 m', '6×3 m', '6×6 m', '9×3 m', '6×30 m'],
    image: 'kontejnerska-dugacka-1',
    imagePosition: '50% 50%',
    highlights: ['Ravan krov, pravougaona osnova', 'Više modula može da se spoji', 'Moguća terasa uz dužu stranu'],
    uses: ['Kancelarija', 'Radionica', 'Skladište', 'Stanovanje'],
    labels: { length: 'Dužina', width: 'Širina', height: 'Visina' },
    limits: {
      length: { min: 2, max: 30 },
      width: { min: 2, max: 12 },
      height: { min: 2.2, max: 4 },
    },
    presets: [
      { id: '6x2.4', label: '6×2,4', length: 6, width: 2.4, height: 2.5 },
      { id: '6x3', label: '6×3', length: 6, width: 3, height: 2.5 },
      { id: '6x6', label: '6×6', length: 6, width: 6, height: 2.5 },
      { id: '6x9', label: '6×9', length: 9, width: 6, height: 2.5 },
      { id: '9x3', label: '9×3', length: 9, width: 3, height: 2.5 },
      { id: '6x7.5', label: '6×7,5', length: 7.5, width: 6, height: 2.4 },
    ],
  },
  {
    id: 'skica',
    name: 'Imam svoju skicu',
    shortName: 'Po skici',
    description: 'Slikajte skicu telefonom. Sajt je pretvara u čist crtež, Vi dodate mere i pošaljete.',
    examples: ['skica sa papira', 'bilo koja dimenzija'],
    image: 'objekat-ploca-1',
    labels: { length: 'Dužina', width: 'Širina', height: 'Visina' },
    presets: [],
  },
]

/** Korak za slajdere i polja dimenzija (m) */
export const DIM_STEP = 0.1

export function getProduct(id: ProductType): Product {
  return products.find((p) => p.id === id) ?? products[0]
}

export function isBuildType(t: ProductType): t is BuildType {
  return t !== 'skica'
}

/** Rok izrade */
export const leadTime = {
  standard: '15–20 radnih dana',
  large: 'do 30 radnih dana',
  /** iznad ove površine (m²) prikazuje se duži rok. [POTVRDITI] */
  largeAreaThreshold: 80,
}
