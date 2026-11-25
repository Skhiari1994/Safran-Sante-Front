/**
 * Navigation entre les fiches d'une liste de sélection (boutons « première / précédente / suivante / dernière »).
 * Fonctions pures : l'ordre, l'identité d'une ligne et les bornes sont testés sans navigateur.
 */

export type SensNavigation = 'premier' | 'precedent' | 'suivant' | 'dernier';

type Colonne = { key: string; label?: string };

/** Ce qu'il faut retenir de la dernière sélection pour se déplacer ensuite, même si la fenêtre de sélection a été détruite. */
export interface ContexteNavigation {
  /** Colonnes qui ordonnent la navigation, dans l'ordre d'affichage de la fenêtre. */
  cles: string[];
  /** Identité de la fiche affichée (voir `signature`). */
  signature: string;
  /** true si la liste parcourue est le résultat d'un filtre. */
  filtre: boolean;
  /** Identités des fiches du filtre d'origine ; null = toute la liste. */
  signaturesPortee: string[] | null;
}

export interface ResultatNavigation<T> {
  /** Liste parcourue, dans l'ordre de navigation. */
  liste: T[];
  /** Position (à partir de 0) de la fiche visée. */
  index: number;
  /** Position (à partir de 0) de la fiche actuellement affichée : égale à `index` quand on est déjà à la borne. */
  courant: number;
  item: T;
}

/** Ordre « naturel » : 2 < 10 < 1000 < 10000, et non l'ordre du texte (1, 10, 1000, 10000, 1001). */
const collateur = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });

const estDate = (cle: string) => /^dat/i.test(cle);

/** Colonnes qui ordonnent la navigation : toutes les colonnes visibles, dans l'ordre où la fenêtre les affiche. */
export function clesDeNavigation(colonnes: Colonne[] | null | undefined): string[] {
  return (colonnes ?? []).map(c => c?.key).filter((k): k is string => !!k);
}

/**
 * Instant d'une date venant de la base : objet Date, « 2021-11-09 00:00:00.0 », « 2021-11-09T00:00:00 » ou « 09/11/2021 ».
 * Une valeur vide ou illisible passe avant toutes les dates.
 */
export function instantDe(valeur: unknown): number {
  if (valeur instanceof Date) return valeur.getTime();
  if (typeof valeur === 'number') return valeur;
  if (typeof valeur !== 'string') return Number.NEGATIVE_INFINITY;
  const texte = valeur.trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(texte);
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]);
  m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(texte);
  if (m) return Date.UTC(+m[3], +m[2] - 1, +m[1]);
  return Number.NEGATIVE_INFINITY;
}

function comparer(a: any, b: any, cle: string): number {
  if (estDate(cle)) {
    const x = instantDe(a?.[cle]);
    const y = instantDe(b?.[cle]);
    if (x !== y) return x < y ? -1 : 1;
    return 0;
  }
  return collateur.compare(String(a?.[cle] ?? ''), String(b?.[cle] ?? ''));
}

/**
 * Copie de la liste triée sur les colonnes, de gauche à droite : la suivante départage les égalités de la précédente
 * (nombres dans l'ordre numérique, dates dans l'ordre chronologique). Sans colonne : ordre reçu.
 */
export function ordonner<T>(liste: T[] | null | undefined, cles: string[] | null | undefined): T[] {
  const copie = [...(liste ?? [])];
  const colonnes = cles ?? [];
  if (!colonnes.length) return copie;
  return copie.sort((a: any, b: any) => {
    for (const cle of colonnes) {
      const r = comparer(a, b, cle);
      if (r !== 0) return r;
    }
    return 0;
  });
}

/** Position visée depuis `index` ; ne sort jamais de la liste. -1 si la liste est vide. */
export function positionCible(index: number, total: number, sens: SensNavigation): number {
  if (total <= 0) return -1;
  switch (sens) {
    case 'premier': return 0;
    case 'dernier': return total - 1;
    case 'precedent': return Math.max(0, index - 1);
    case 'suivant': return Math.min(total - 1, index + 1);
  }
}

/**
 * Identité d'une ligne : ses valeurs dans les colonnes visibles. Une liste de bulletins peut avoir plusieurs lignes pour
 * le même matricule ; une colonne seule ne les distingue pas, la ligne entière si. Une liste rechargée porte de nouveaux
 * objets : on retrouve la ligne par ses valeurs, pas par sa référence.
 */
export function signature(ligne: any, colonnes: Colonne[] | null | undefined): string {
  return (colonnes ?? []).map(c => String(ligne?.[c.key] ?? '')).join('\u0001');
}

/**
 * Fiche visée à partir de la fiche affichée (`contexte`) dans la liste actuelle.
 * Renvoie null si la fiche affichée n'est plus dans la liste (supprimée, ou sortie du filtre d'origine).
 */
export function cibleNavigation<T>(
  liste: T[] | null | undefined,
  colonnes: Colonne[] | null | undefined,
  contexte: ContexteNavigation,
  sens: SensNavigation,
): ResultatNavigation<T> | null {
  const portee = contexte.signaturesPortee ? new Set(contexte.signaturesPortee) : null;
  const base = portee ? (liste ?? []).filter(l => portee.has(signature(l, colonnes))) : (liste ?? []);
  const ordre = ordonner(base, contexte.cles);
  const courant = ordre.findIndex(l => signature(l, colonnes) === contexte.signature);
  if (courant < 0) return null;
  const index = positionCible(courant, ordre.length, sens);
  return { liste: ordre, index, courant, item: ordre[index] };
}

/** Les valeurs qui identifient la fiche affichée, pour l'indicateur de la barre d'outils. */
export interface IdentificationFiche {
  /** Valeurs utiles seulement (3 au plus), séparées par « · » : « 1000 » ou « 202622 · 1234 · 0 ». */
  code: string;
  /** Toutes les valeurs utiles, avec le nom de leur colonne, pour l'infobulle. */
  detail: string;
}

const PARTIES_AFFICHEES = 3;

/**
 * Plus petit début de ligne qui désigne la fiche sans ambiguïté dans la liste parcourue : le matricule seul s'il est
 * unique, sinon le matricule et la colonne suivante, et ainsi de suite jusqu'à ce que plus aucune autre ligne ne
 * corresponde. `formater` met en forme une valeur (les dates).
 */
export function identification(
  ligne: any,
  liste: any[],
  colonnes: Colonne[] | null | undefined,
  formater: (cle: string, valeur: unknown) => string = (_c, v) => String(v ?? ''),
): IdentificationFiche {
  const cols = colonnes ?? [];
  if (!cols.length) return { code: '', detail: '' };
  const brut = (l: any, i: number) => String(l?.[cols[i].key] ?? '');
  let candidates = liste;
  let n = cols.length;
  for (let i = 0; i < cols.length; i++) {
    candidates = candidates.filter(l => brut(l, i) === brut(ligne, i));
    if (candidates.length <= 1) {
      n = i + 1;
      break;
    }
  }
  const valeurs = cols.slice(0, n).map((c, i) => ({ nom: c.label ?? c.key, valeur: formater(c.key, ligne?.[c.key]) }));
  const visibles = valeurs.slice(0, PARTIES_AFFICHEES).map(v => v.valeur);
  const code = visibles.join(' · ') + (valeurs.length > PARTIES_AFFICHEES ? ' …' : '');
  const detail = valeurs.map(v => `${v.nom} ${v.valeur}`).join(' · ');
  return { code, detail };
}
