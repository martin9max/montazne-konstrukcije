/**
 * Cene. [POTVRDITI cene sa klijentom]
 * Dok se ne potvrde, sve vrednosti su 0 i showPrice je false:
 * tada sažetak prikazuje „Cenu potvrđujemo u razgovoru“.
 */
export const pricing = {
  showPrice: false,
  currency: 'EUR',
  /** cena po m² osnove, po tipu */
  perM2: {
    aframe: 0,
    kontejnerska: 0,
  },
  /** doplata po m² za zavarenu varijantu (može biti i negativna) */
  joiningPerM2: { sraf: 0, var: 0 },
  /** doplata za boju koja nije podrazumevana (paušalno) */
  customColorFlat: 0,
  galleryPerM2: 0,
  terracePerM2: 0,
  assemblyPerM2: 0,
  /** prevoz: cena po km; km se dogovara u razgovoru, pa se u okvirnoj ceni ne računa */
  transportPerKm: 0,
}
