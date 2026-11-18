/**
 * Icônes du menu latéral (Remix Icon).
 *
 * L'icône est choisie dans l'écran « Gestion Menu » et stockée en base (module : MDL_ICON1, niveau 1 : EVT_ICON).
 * Quand elle est vide, on la déduit du libellé : une entrée n'est donc jamais sans icône.
 *  - niveau 0 : modules (Référentiels, Gestion des adhésions mutuelles, ...)
 *  - niveau 1 : groupes et écrans directs sous un module (Fiche adhérent, Edition, ...)
 * Les niveaux suivants n'ont pas d'icône (simple puce), pour garder un menu lisible.
 */
type Regle = [RegExp, string];

const NIVEAU_0: Regle[] = [
  [/referentiel/, 'ri-database-2-line'],
  [/rembours|frais medic/, 'ri-heart-pulse-line'],
  [/adhesion|adherent/, 'ri-team-line'],
  [/cotisation/, 'ri-wallet-3-line'],
  [/credit|pret/, 'ri-bank-line'],
  [/indemnit/, 'ri-hand-coin-line'],
  [/retraite/, 'ri-timer-line'],
  [/convention/, 'ri-file-list-2-line'],
  [/autorisation/, 'ri-key-2-line'],
  [/profil/, 'ri-user-settings-line'],
  [/admin/, 'ri-shield-user-line'],
  [/chat/, 'ri-chat-3-line'],
  [/dashboard|tableau de bord/, 'ri-dashboard-2-line'],
  [/calendrier|conge/, 'ri-calendar-2-line'],
  [/prime/, 'ri-award-line'],
  [/paie/, 'ri-bill-line'],
];
const DEFAUT_NIVEAU_0 = 'ri-apps-2-line';

const NIVEAU_1: Regle[] = [
  [/^edition/, 'ri-printer-line'],
  [/parametrage/, 'ri-settings-3-line'],
  [/preparation/, 'ri-file-edit-line'],
  [/depart|reintegration/, 'ri-logout-circle-r-line'],
  [/chargement/, 'ri-upload-cloud-2-line'],
  [/prise en charge maladie/, 'ri-stethoscope-line'],
  [/bulletin/, 'ri-file-list-3-line'],
  [/envoi/, 'ri-send-plane-line'],
  [/reception/, 'ri-inbox-archive-line'],
  [/reglement/, 'ri-secure-payment-line'],
  [/adherent mutuelle/, 'ri-shield-check-line'],
  [/fiche/, 'ri-profile-line'],
  [/commission/, 'ri-percent-line'],
  [/deblocage/, 'ri-lock-unlock-line'],
  [/modification/, 'ri-pencil-line'],
  [/saisie/, 'ri-edit-box-line'],
  [/validation/, 'ri-checkbox-circle-line'],
  [/consultation/, 'ri-search-eye-line'],
  [/virement/, 'ri-exchange-line'],
  [/cloture/, 'ri-lock-line'],
  [/suspension/, 'ri-pause-circle-line'],
  [/demande|offre/, 'ri-file-text-line'],
  [/cotisation/, 'ri-wallet-3-line'],
  [/credit|pret/, 'ri-bank-line'],
  [/^adherent/, 'ri-user-line'],
  [/utilisateur|compte/, 'ri-user-settings-line'],
  [/rapport/, 'ri-file-chart-line'],
  [/conge/, 'ri-calendar-2-line'],
  [/formation/, 'ri-book-2-line'],
  [/menu/, 'ri-menu-line'],
];
const DEFAUT_NIVEAU_1 = 'ri-folder-2-line';

function normaliser(texte: unknown): string {
  return String(texte ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Icône d'une entrée de menu : `iconeBase` = icône enregistrée en base (prioritaire), `libelle` = libellé affiché. */
export function iconeMenu(iconeBase: string | null | undefined, libelle: string, niveau: 0 | 1): string {
  const saisie = (iconeBase || '').trim();
  if (saisie) {
    return saisie;
  }
  const texte = normaliser(libelle);
  const regles = niveau === 0 ? NIVEAU_0 : NIVEAU_1;
  const trouvee = regles.find(([motif]) => motif.test(texte));
  return trouvee ? trouvee[1] : (niveau === 0 ? DEFAUT_NIVEAU_0 : DEFAUT_NIVEAU_1);
}
