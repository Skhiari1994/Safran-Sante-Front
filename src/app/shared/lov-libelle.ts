/**
 * Libellé d'un champ à loupe (nationalité, département, banque…) pour le code d'une fiche, lu dans la liste de référence.
 * Vide si la fiche n'a pas de code ou si le code n'est pas dans la liste : un champ ne garde jamais le libellé de la
 * fiche précédente. La comparaison ignore les espaces et la casse, comme la fenêtre de sélection (`app-lov`).
 */
export function libelleDe(
  liste: any[] | null | undefined,
  champCode: string,
  code: unknown,
  champLibelle: string,
): string {
  const recherche = String(code ?? '').trim().toLowerCase();
  if (!recherche) return '';
  const trouve = (liste ?? []).find(l => String(l?.[champCode] ?? '').trim().toLowerCase() === recherche);
  return String(trouve?.[champLibelle] ?? '');
}
