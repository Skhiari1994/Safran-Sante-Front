import { Observable } from 'rxjs';

/** Une page de résultats renvoyée par le serveur : les lignes de la page et le nombre total de lignes trouvées. */
export interface PageLov<T = any> {
  content: T[];
  total: number;
  /** Effectifs du filtre Sexe sur toute la liste (fenêtre de la barre d'outils), si demandés. */
  sexes?: { tous: number; M: number; F: number };
}

/**
 * Clés spéciales du paramètre « filtres » (en plus des colonnes) :
 * - _q : texte de la barre de recherche unique (chaque mot doit se retrouver dans une colonne) ;
 * - _sexe : 'M' ou 'F' ;
 * - _sexes : 'oui' pour recevoir aussi les effectifs du filtre Sexe.
 */
export const FILTRE_GLOBAL = '_q';
export const FILTRE_SEXE = '_sexe';
export const AVEC_SEXES = '_sexes';

/**
 * Liste d'une fenêtre de recherche (app-lov) lue page par page sur le serveur, au lieu d'être chargée en entier.
 * - page : lignes correspondant aux filtres saisis (clé = colonne, valeur = texte « contient »), page numérotée à partir de 0 ;
 * - parCode : la ligne dont le code est exactement celui saisi dans le champ (null si aucune).
 */
export interface SourceLovServeur<T = any> {
  page(filtres: Record<string, string>, page: number, taille: number): Observable<PageLov<T>>;
  parCode(code: string): Observable<T | null>;
}
