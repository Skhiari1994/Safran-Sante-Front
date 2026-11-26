import { Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import Swal from 'sweetalert2';
import { dernierAffichageSwal, suivreSwal } from '../swal-suivi';

/** Nature d'une opération d'écriture, pour un message qui dit ce qui s'est passé. */
export type NatureEcriture = 'ajout' | 'modification' | 'suppression' | 'enregistrement' | 'validation' | 'envoi' | 'import';

const TEXTES: Record<NatureEcriture, { succes: string; echec: string }> = {
  ajout: { succes: 'Ajout effectué', echec: "L'ajout n'a pas pu être effectué" },
  modification: { succes: 'Modification enregistrée', echec: "La modification n'a pas pu être enregistrée" },
  suppression: { succes: 'Suppression effectuée', echec: "La suppression n'a pas pu être effectuée" },
  enregistrement: { succes: 'Enregistrement effectué', echec: "L'enregistrement n'a pas pu être effectué" },
  validation: { succes: 'Validation effectuée', echec: "La validation n'a pas pu être effectuée" },
  envoi: { succes: 'Envoi effectué', echec: "L'envoi n'a pas pu être effectué" },
  import: { succes: 'Fichier importé', echec: "Le fichier n'a pas pu être importé" },
};

/**
 * Adresses appelées en POST / PUT / DELETE qui ne modifient rien (vérifications, calculs, impressions, connexion,
 * messagerie…) : pas de message pour elles.
 */
const LECTURE = /exist|verif|calcul|controle|check|\/get|search|recherch|totau|count|nbr|pdf|excel|print|imprim|edition|generate|export|rapport|report|authenticate|login|logout|refresh|apikey|chat|messages|reaction|notif|\/read\b|session/i;

/** Délai sans nouvelle écriture avant d'annoncer le résultat (un enregistrement envoie souvent plusieurs requêtes). */
const DELAI_MS = 700;

/**
 * Message de résultat pour chaque ajout, modification, suppression ou enregistrement, sur tous les écrans.
 *
 * Les requêtes d'une même action (en-tête puis lignes…) sont regroupées : un seul message à la fin. Si l'écran a
 * affiché lui-même un message pendant l'action (fenêtre SweetAlert), on n'en ajoute pas : pas de doublon.
 * Succès : notification discrète en haut à droite, qui se ferme seule. Échec : fenêtre à lire et fermer.
 */
@Injectable({ providedIn: 'root' })
export class MessagesResultatService {
  private enCours = 0;
  private debutAction = 0;
  private reussites: NatureEcriture[] = [];
  private echecs: { nature: NatureEcriture; detail: string }[] = [];
  private minuterie: any = null;

  constructor(private zone: NgZone) {
    // démarre le suivi des fenêtres SweetAlert (repère les messages affichés par les écrans eux-mêmes)
    suivreSwal(() => { });
  }

  /** Requête d'écriture à suivre (sinon null : lecture, connexion, messagerie…). */
  natureDe(req: HttpRequest<unknown>): NatureEcriture | null {
    const methode = req.method.toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(methode)) return null;
    const url = req.url.split('?')[0];
    if (LECTURE.test(url)) return null;
    const fin = url.split('/').filter(Boolean).slice(-2).join('/');
    if (methode === 'DELETE' || /delet|supp|remove|\/del[A-Z_]/i.test(fin)) return 'suppression';
    if (/valid/i.test(fin)) return 'validation';
    if (/envoi|send/i.test(fin)) return 'envoi';
    if (/upload|import/i.test(fin)) return 'import';
    if (methode === 'PUT' || methode === 'PATCH' || /update|maj|modif/i.test(fin)) return 'modification';
    return 'enregistrement';
  }

  debut(): void {
    if (this.minuterie) { clearTimeout(this.minuterie); this.minuterie = null; }
    if (this.enCours === 0 && this.reussites.length === 0 && this.echecs.length === 0) this.debutAction = Date.now();
    this.enCours++;
  }

  succes(nature: NatureEcriture): void {
    this.reussites.push(nature);
    this.terminer();
  }

  echec(nature: NatureEcriture, err: unknown): void {
    // 401 : session expirée, la déconnexion s'en charge
    if (err instanceof HttpErrorResponse && err.status === 401) { this.terminer(); return; }
    this.echecs.push({ nature, detail: this.detailErreur(err) });
    this.terminer();
  }

  /** Requête annulée (écran quitté…) : ni succès ni échec. */
  annulation(): void {
    this.terminer();
  }

  private terminer(): void {
    this.enCours = Math.max(0, this.enCours - 1);
    if (this.enCours > 0) return;
    this.zone.runOutsideAngular(() => {
      if (this.minuterie) clearTimeout(this.minuterie);
      this.minuterie = setTimeout(() => this.zone.run(() => this.annoncer()), DELAI_MS);
    });
  }

  private annoncer(): void {
    this.minuterie = null;
    const reussites = this.reussites, echecs = this.echecs, debut = this.debutAction;
    this.reussites = [];
    this.echecs = [];
    // l'écran a déjà affiché son propre message pendant l'action : rien à ajouter
    if (dernierAffichageSwal() >= debut) return;
    if (echecs.length) {
      const { nature, detail } = echecs[0];
      Swal.fire({
        icon: 'error',
        title: TEXTES[nature].echec,
        html: `<p class="resultat__detail">${echapper(detail)}</p>`
          + (reussites.length ? `<p class="resultat__partiel">Une partie des données a cependant été enregistrée.</p>` : ''),
        confirmButtonText: 'Compris',
        buttonsStyling: false,
        customClass: {
          popup: 'popup-app popup-app--error',
          confirmButton: 'btn btn-primary px-4',
          htmlContainer: 'resultat',
        },
      });
      return;
    }
    if (!reussites.length) return;
    const nature = reussites.every(n => n === reussites[0]) ? reussites[0] : 'enregistrement';
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: TEXTES[nature].succes,
      showConfirmButton: false,
      showCloseButton: true,
      timer: 3500,
      timerProgressBar: true,
      customClass: { popup: 'toast-app toast-app--success' },
      didOpen: el => {
        // la notification ne se ferme pas pendant qu'on la survole
        el.addEventListener('mouseenter', () => Swal.stopTimer());
        el.addEventListener('mouseleave', () => Swal.resumeTimer());
      },
    });
  }

  /** Texte d'erreur lisible : message du serveur s'il y en a un, sinon explication selon le cas. */
  private detailErreur(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const corps: any = err.error;
      const duServeur = typeof corps === 'string' ? corps : corps?.message || corps?.error || corps?.detail;
      if (typeof duServeur === 'string' && duServeur.trim() && duServeur.length < 300 && !/<html/i.test(duServeur)) {
        return duServeur.trim();
      }
      if (err.status === 0) return 'Le serveur ne répond pas. Vérifiez la connexion puis réessayez.';
      if (err.status === 403) return "Le serveur a refusé l'opération (droits insuffisants ou erreur interne).";
      if (err.status === 404) return "L'élément demandé est introuvable : il a peut-être déjà été modifié ou supprimé.";
      if (err.status === 409) return "Cet élément est utilisé ailleurs ou existe déjà.";
      if (err.status >= 500) return 'Erreur interne du serveur. Réessayez ; si le problème persiste, contactez le support.';
      return `Erreur ${err.status}.`;
    }
    return 'Une erreur inattendue est survenue.';
  }
}

function echapper(texte: string): string {
  const r: { [c: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return texte.replace(/[&<>"']/g, c => r[c]);
}
