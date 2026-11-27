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
export function focaliser(champ: HTMLElement, sansDefilement = false): void {
  champ.dataset['fpSansOuverture'] = '1';
  // sansDefilement : la page est déjà en train de défiler (ex. remontée en haut) ; un défilement de plus l'interromprait
  champ.focus(sansDefilement ? { preventScroll: true } : undefined);
  delete champ.dataset['fpSansOuverture'];
  (champ as any)._flatpickr?.close?.();
  if (champ instanceof HTMLInputElement && (champ.type === 'text' || champ.type === '')) {
    try { champ.select(); } catch { /* certains champs masqués refusent la sélection */ }
  }
  if (!sansDefilement) champ.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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

/** Jusqu'à cette heure, les lignes ajoutées par le programme ne prennent pas le curseur (voir reserverCurseur). */
let curseurReserveJusqua = 0;

/**
 * Le curseur va ailleurs (ex. Matricule après « Nouveau ») : pendant `ms`, les lignes vides que l'écran recrée en
 * vidant son formulaire ne prennent pas le curseur (sinon la page descendrait jusqu'au tableau).
 */
export function reserverCurseur(ms = 1500): void {
  curseurReserveJusqua = Date.now() + ms;
}

/**
 * Heure de la dernière demande d'ajout de ligne faite par l'utilisateur : clic sur un bouton « Ajouter » (.add-btn),
 * Alt+N, ou Entrée (sur la dernière case d'un tableau). Les lignes que l'écran crée lui-même (chargement d'une fiche,
 * Nouveau, Retour, dernière ligne supprimée) ne doivent pas déplacer le curseur ni faire défiler la page.
 */
let derniereDemandeAjout = 0;
if (typeof document !== 'undefined') {
  document.addEventListener('click', ev => {
    if (ev.isTrusted && (ev.target as Element | null)?.closest?.('.add-btn, [data-ajout-ligne]')) derniereDemandeAjout = Date.now();
  }, true);
  document.addEventListener('keydown', ev => {
    if (!ev.isTrusted) return;
    const entreeDansTableau = ev.key === 'Enter' && !!(ev.target as Element | null)?.closest?.('.p-datatable');
    if (entreeDansTableau || (ev.altKey && (ev.key || '').toLowerCase() === 'n')) derniereDemandeAjout = Date.now();
  }, true);
}

/** Après l'ajout d'une ligne demandé par l'utilisateur : curseur dans sa première case saisissable. */
export function focusPremiereCase(table: Table | undefined, indexLigne: number, essais = 12): void {
  if (Date.now() < curseurReserveJusqua) return;
  if (Date.now() - derniereDemandeAjout > 1500) return;   // ligne créée par le programme : le curseur reste où il est
  focusCaseLigne(table, indexLigne, false, essais);
}
