/**
 * Osnovni podaci o firmi.
 * Sve što je označeno sa [POTVRDITI] još nije dogovoreno sa klijentom.
 */
export const business = {
  name: 'Montažne Konstrukcije',
  tagline: ['ČVRSTA', 'PRECIZNA', 'PO MERI'],
  place: 'Boranjac', // sa logoa
  phoneDisplay: '065 864 7210',
  phoneHref: 'tel:+381658647210',
  phoneE164: '+381658647210',
  /** [POTVRDITI] koji email je zvaničan */
  email: 'officemontaznekonstrukcije@gmail.com',
  instagram: {
    handle: '@montazne_konstrukcije.rs',
    url: 'https://www.instagram.com/montazne_konstrukcije.rs/',
  },
  /** [POTVRDITI] adresa radionice; null = ne prikazuje se */
  address: null as string | null,
  /** [POTVRDITI] link ka Google mapi; null = ne prikazuje se */
  mapUrl: null as string | null,
  /** [POTVRDITI] područje isporuke i montaže */
  serviceArea: 'Cela Srbija' as string | null,
  /** [POTVRDITI] domen */
  siteUrl: 'https://montaznekonstrukcije.rs',
  responseTime: 'u roku od 24h',
} as const
