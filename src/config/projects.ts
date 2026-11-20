/**
 * Realizovani projekti (galerija na početnoj). Fotografije su sa Instagram profila
 * @montazne_konstrukcije.rs (samo slike bez teksta preko). `image` je naziv fajla bez ekstenzije.
 * Natpisi opisuju ono što se vidi na slici; mere samo tamo gde ih je klijent naveo. [POTVRDITI]
 */
export interface Project {
  image: string
  title: string
  type: 'aframe' | 'kontejnerska'
}

export const projects: Project[] = [
  { image: 'aframe-6x5x5-galerija-4', title: 'A-frame 6×5×5 m sa galerijom', type: 'aframe' },
  { image: 'kontejnerska-dugacka-2', title: 'Kontejnerska konstrukcija', type: 'kontejnerska' },
  { image: 'kontejnerska-stubovi-2', title: 'Kontejnerska podignuta na stubove', type: 'kontejnerska' },
  { image: 'aframe-6x5x5-galerija-3', title: 'A-frame 6×5×5 m, montaža', type: 'aframe' },
  { image: 'konstrukcija-nosaci-1', title: 'Konstrukcija sa krovnim nosačima, na betonskim stopama', type: 'kontejnerska' },
  { image: 'montaza-1', title: 'Montaža na lokaciji kupca', type: 'kontejnerska' },
  { image: 'konstrukcija-krov-1', title: 'Kontejnerska sa drvenim krovom na dve vode', type: 'kontejnerska' },
  { image: 'kontejnerska-ploca-1', title: 'Veća kontejnerska na betonskoj ploči', type: 'kontejnerska' },
  { image: 'aframe-6x5x5-galerija-2', title: 'A-frame sa galerijom, pogled sa čela', type: 'aframe' },
  { image: 'konstrukcija-hala-1', title: 'Konstrukcija u postojećem objektu', type: 'kontejnerska' },
  { image: 'konstrukcija-nosaci-2', title: 'Konstrukcija sa krovnim nosačima, pogled sa strane', type: 'kontejnerska' },
  { image: 'kontejnerska-stubovi-1', title: 'Kontejnerska na stubovima, sa podom za terasu', type: 'kontejnerska' },
]
