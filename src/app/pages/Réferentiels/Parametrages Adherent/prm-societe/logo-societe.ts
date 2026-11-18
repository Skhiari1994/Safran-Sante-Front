/**
 * Logo d'une société. Le fichier choisi peut être grand : l'écran le réduit avant l'envoi (côté le plus long : 600 px),
 * ce qui garde un logo net et léger. Le serveur refait le contrôle d'après le contenu réel (PNG, JPEG ou WebP, 5 Mo au plus).
 */
export const TYPES_LOGO = ['image/png', 'image/jpeg', 'image/webp'];
/** Poids maximal du logo envoyé au serveur. */
export const TAILLE_MAX_LOGO = 5 * 1024 * 1024;
/** Poids maximal du fichier choisi, avant réduction (au-delà, le navigateur peut manquer de mémoire pour le décoder). */
export const TAILLE_MAX_SOURCE_LOGO = 20 * 1024 * 1024;
/** Côté le plus long d'un logo après réduction, en pixels. */
export const COTE_MAX_LOGO = 600;

/** @returns le message à afficher si le fichier choisi est refusé, sinon null */
export function erreurLogo(fichier: { type: string; size: number }): string | null {
  if (!TYPES_LOGO.includes(fichier.type)) {
    return 'Format non pris en charge : utilisez une image PNG, JPEG ou WebP.';
  }
  if (fichier.size > TAILLE_MAX_SOURCE_LOGO) {
    return 'Le fichier dépasse 20 Mo. Choisissez une image plus légère.';
  }
  if (fichier.size === 0) {
    return 'Le fichier est vide.';
  }
  return null;
}

/** Dimensions après réduction : le côté le plus long ne dépasse pas coteMax, proportions conservées, jamais d'agrandissement. */
export function dimensionsCible(largeur: number, hauteur: number, coteMax = COTE_MAX_LOGO): { largeur: number; hauteur: number } {
  const plusLong = Math.max(largeur, hauteur);
  if (plusLong <= coteMax) {
    return { largeur, hauteur };
  }
  const echelle = coteMax / plusLong;
  return { largeur: Math.max(1, Math.round(largeur * echelle)), hauteur: Math.max(1, Math.round(hauteur * echelle)) };
}

export interface LogoPrepare {
  fichier: File;
  /** vrai si l'image a été réduite ou recompressée */
  reduit: boolean;
  largeurOrigine: number;
  hauteurOrigine: number;
  largeur: number;
  hauteur: number;
}

function nomAvecExtension(nom: string, type: string): string {
  const extension = type === 'image/jpeg' ? 'jpg' : 'png';
  const base = nom.replace(/\.[^.]+$/, '') || 'logo';
  return `${base}.${extension}`;
}

/**
 * Prépare le logo à envoyer. Une image déjà petite (≤ 600 px et ≤ 5 Mo) est envoyée telle quelle.
 * Sinon elle est réduite : un JPEG reste un JPEG, les PNG et WebP deviennent des PNG (la transparence est conservée).
 * @throws Error avec un message prêt à afficher
 */
export async function preparerLogo(fichier: File): Promise<LogoPrepare> {
  let image: ImageBitmap;
  try {
    image = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
  } catch {
    throw new Error("Cette image est illisible. Essayez un autre fichier.");
  }
  try {
    const cible = dimensionsCible(image.width, image.height);
    const redimensionne = cible.largeur !== image.width || cible.hauteur !== image.height;
    if (!redimensionne && fichier.size <= TAILLE_MAX_LOGO) {
      return { fichier, reduit: false, largeurOrigine: image.width, hauteurOrigine: image.height, largeur: image.width, hauteur: image.height };
    }

    const toile = document.createElement('canvas');
    toile.width = cible.largeur;
    toile.height = cible.hauteur;
    const contexte = toile.getContext('2d');
    if (!contexte) {
      throw new Error("Cette image ne peut pas être réduite par votre navigateur.");
    }
    contexte.imageSmoothingQuality = 'high';
    contexte.drawImage(image, 0, 0, cible.largeur, cible.hauteur);

    const type = fichier.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
    const blob: Blob | null = await new Promise((resolve) => toile.toBlob(resolve, type, 0.9));
    if (!blob) {
      throw new Error("La réduction de l'image a échoué. Essayez un autre fichier.");
    }
    if (blob.size > TAILLE_MAX_LOGO) {
      throw new Error('Le logo reste trop lourd (plus de 5 Mo) même après réduction. Choisissez une image plus simple.');
    }
    // une réduction qui alourdirait le fichier d'origine (déjà petit) n'a pas d'intérêt
    if (!redimensionne && blob.size >= fichier.size) {
      return { fichier, reduit: false, largeurOrigine: image.width, hauteurOrigine: image.height, largeur: image.width, hauteur: image.height };
    }
    const reduit = new File([blob], nomAvecExtension(fichier.name, type), { type });
    return { fichier: reduit, reduit: true, largeurOrigine: image.width, hauteurOrigine: image.height, largeur: cible.largeur, hauteur: cible.hauteur };
  } finally {
    image.close();
  }
}

/** « 1,2 Mo » ou « 85 Ko » */
export function tailleLisible(octets: number): string {
  return octets >= 1024 * 1024
    ? `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
    : `${Math.max(1, Math.round(octets / 1024))} Ko`;
}
