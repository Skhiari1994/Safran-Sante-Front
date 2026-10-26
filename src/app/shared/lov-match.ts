const MATRICULE_KEY = /^mat(_|ricule|pers|int|adm|$)/i;

/**
 * Comparaison utilisée par les recherches des LOV : égalité stricte pour les
 * colonnes matricule (101 ne ramène pas 1101), "contient" pour les autres.
 */
export function lovMatch(key: string, value: any, query: string): boolean {
  const q = (query ?? '').toString().trim().toLowerCase();
  if (!q) return true;
  if (value == null) return false;
  const v = value.toString().trim().toLowerCase();
  return MATRICULE_KEY.test(key) ? v === q : v.includes(q);
}
