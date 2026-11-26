import { Table } from 'primeng/table';

/** Champ dans lequel l'utilisateur peut saisir (les cases à cocher de sélection et les champs en lecture seule sont exclus). */
export function estSaisissable(el: HTMLElement): boolean {
  const champ = el as HTMLInputElement;
  if (champ.disabled || champ.readOnly) return false;
  if (el.tagName === 'INPUT' && ['checkbox', 'radio', 'hidden', 'button', 'submit'].includes(champ.type)) return false;
  return el.getClientRects().length > 0;   // visible à l'écran
}

/** Champs saisissables d'une ligne, dans l'ordre d'affichage. */
export function champsSaisissables(ligne: Element | null | undefined): HTMLElement[] {
  return ligne ? Array.from(ligne.querySelectorAll<HTMLElement>('input, select, textarea')).filter(estSaisissable) : [];
}

/**
 * Place le curseur dans un champ sans ouvrir son calendrier (global-datepicker ne l'ouvre que sur un clic de
 * l'utilisateur) ; le texte d'un champ texte est sélectionné pour pouvoir être remplacé directement.
 */
export function focaliser(champ: HTMLElement): void {
  champ.dataset['fpSansOuverture'] = '1';
  champ.focus();
  delete champ.dataset['fpSansOuverture'];
  (champ as any)._flatpickr?.close?.();
  if (champ instanceof HTMLInputElement && (champ.type === 'text' || champ.type === '')) {
    try { champ.select(); } catch { /* certains champs masqués refusent la sélection */ }
  }
  champ.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

/**
 * Affiche la page qui contient la ligne `indexLigne` puis place le curseur dans sa première case saisissable
 * (ou sa dernière si `derniere` est vrai). Les champs d'une ligne n'apparaissent qu'une fois la ligne passée
 * en édition : on réessaie donc quelques fois (toutes les 50 ms) le temps qu'ils soient affichés.
 */
export function focusCaseLigne(table: Table | undefined, indexLigne: number, derniere = false, essais = 12): void {
  if (!table || indexLigne < 0) return;

  const parPage = Number(table.rows) || 0;
  if (table.paginator && parPage > 0) {
    const premiere = Math.floor(indexLigne / parPage) * parPage;
    if (table.first !== premiere) {
      table.first = premiere;
    }
  }

  const tenter = (reste: number) => {
    const racine: HTMLElement | undefined = table.el?.nativeElement;
    const lignes = racine ? racine.querySelectorAll<HTMLElement>('.p-datatable-tbody > tr') : null;
    const position = indexLigne - (table.paginator ? (table.first || 0) : 0);
    const champs = champsSaisissables(lignes && position >= 0 ? lignes[position] : undefined);
    const champ = derniere ? champs[champs.length - 1] : champs[0];
    if (champ) {
      focaliser(champ);
      return;
    }
    if (reste > 0) setTimeout(() => tenter(reste - 1), 50);
  };
  setTimeout(() => tenter(essais), 0);
}

/** Après l'ajout d'une ligne : curseur dans sa première case saisissable. */
export function focusPremiereCase(table: Table | undefined, indexLigne: number, essais = 12): void {
  focusCaseLigne(table, indexLigne, false, essais);
}
