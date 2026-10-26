import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { AdherentService } from './adherent.service';

/** Jours avant la date de fin à partir desquels l'alerte d'expiration est affichée (information). */
const SEUIL_ALERTE_JOURS = 30;
/** Au-delà de ce nombre de jours restants, l'alerte est un simple avertissement ; en dessous, elle est critique. */
const SEUIL_AVERTISSEMENT_JOURS = 14;
const SEUIL_CRITIQUE_JOURS = 7;

export type StatutCarteCnam = 'a_venir' | 'en_cours' | 'bientot' | 'expiree' | 'remplacee';

@Injectable({
  providedIn: 'root'
})
export class CarteCnamAlertService {

  constructor(private adherentServ: AdherentService, private router: Router) { }

  private aujourdhuiIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Le rappel « demain » est gardé dans un cookie et non dans le localStorage : celui-ci est vidé à la
   * déconnexion, ce qui annulerait le report dès la reconnexion.
   */
  private nomCookieRappel(matricule: string): string {
    return `carteCnamRappel_${encodeURIComponent(matricule)}`;
  }

  private rappelReporte(matricule: string): boolean {
    try {
      return document.cookie.split('; ').includes(`${this.nomCookieRappel(matricule)}=${this.aujourdhuiIso()}`);
    } catch {
      return false;
    }
  }

  private reporterRappel(matricule: string): void {
    try {
      document.cookie = `${this.nomCookieRappel(matricule)}=${this.aujourdhuiIso()}; max-age=172800; path=/; SameSite=Lax`;
    } catch { /* cookies indisponibles : l'alerte reviendra à la prochaine connexion */ }
  }

  /** Convertit une date « dd/MM/yyyy » (format renvoyé par le back) en Date locale à minuit. */
  parseDateFr(value: string | null | undefined): Date | null {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || '');
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }

  /** Nombre de jours entre aujourd'hui et la date de fin (négatif si la carte est expirée). */
  joursAvantFin(dateFin: string): number | null {
    const fin = this.parseDateFr(dateFin);
    if (!fin) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((fin.getTime() - today.getTime()) / 86400000);
  }

  /**
   * Statut d'une carte par rapport à aujourd'hui et aux autres cartes de l'adhérent :
   * - « a_venir »   : la période n'a pas commencé ;
   * - « en_cours »  : valable aujourd'hui ;
   * - « bientot »   : valable mais expire dans 30 jours ou moins, sans carte plus récente pour la remplacer ;
   * - « expiree »   : terminée et sans carte plus récente ;
   * - « remplacee » : terminée, une carte plus récente existe.
   */
  statutLigne(carte: any, cartes: any[]): StatutCarteCnam | null {
    const fin = this.parseDateFr(carte?.date_fin);
    const debut = this.parseDateFr(carte?.date_debut);
    const jours = this.joursAvantFin(carte?.date_fin);
    if (!fin || !debut || jours === null) return null;

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    if (debut > aujourdhui) return 'a_venir';

    const remplacee = (cartes || []).some(c => {
      const finAutre = this.parseDateFr(c?.date_fin);
      return c !== carte && !!finAutre && finAutre > fin;
    });
    if (jours < 0) return remplacee ? 'remplacee' : 'expiree';
    return !remplacee && jours <= SEUIL_ALERTE_JOURS ? 'bientot' : 'en_cours';
  }

  /**
   * Période proposée pour une nouvelle carte : elle commence le lendemain de la fin de la dernière carte
   * et dure 3 ans (durée des cartes existantes). Renvoie null s'il n'y a aucune carte.
   */
  periodeSuivante(cartes: any[]): { date_debut: string; date_fin: string } | null {
    const derniereFin = (cartes || [])
      .map(c => this.parseDateFr(c?.date_fin))
      .filter((d): d is Date => !!d)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (!derniereFin) return null;

    const debut = new Date(derniereFin.getFullYear(), derniereFin.getMonth(), derniereFin.getDate() + 1);
    const fin = new Date(debut.getFullYear() + 3, debut.getMonth(), debut.getDate());
    const format = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    return { date_debut: format(debut), date_fin: format(fin) };
  }

  /** Première carte existante dont la période recouvre celle de `nouvelle` (bornes incluses). */
  chevauchement(nouvelle: any, autres: any[]): any | undefined {
    const debut = this.parseDateFr(nouvelle?.date_debut);
    const fin = this.parseDateFr(nouvelle?.date_fin);
    if (!debut || !fin) return undefined;
    return (autres || []).find(c => {
      const d = this.parseDateFr(c?.date_debut);
      const f = this.parseDateFr(c?.date_fin);
      return !!d && !!f && d <= fin && debut <= f;
    });
  }

  /** Messages décrivant les jours non couverts entre `nouvelle` et ses cartes voisines (précédente et suivante). */
  trous(nouvelle: any, autres: any[]): string[] {
    const debut = this.parseDateFr(nouvelle?.date_debut);
    const fin = this.parseDateFr(nouvelle?.date_fin);
    if (!debut || !fin) return [];
    const messages: string[] = [];
    const jourMs = 86400000;
    const libelle = (n: number) => `${n} jour${n > 1 ? 's' : ''}`;

    const avec = (autres || []).map(c => ({ c, d: this.parseDateFr(c?.date_debut), f: this.parseDateFr(c?.date_fin) }))
      .filter(x => x.d && x.f) as { c: any; d: Date; f: Date }[];

    const precedente = avec.filter(x => x.f < debut).sort((a, b) => b.f.getTime() - a.f.getTime())[0];
    if (precedente) {
      const n = Math.round((debut.getTime() - precedente.f.getTime()) / jourMs) - 1;
      if (n > 0) {
        messages.push(`${libelle(n)} sans carte entre le ${precedente.c.date_fin} (fin de la carte précédente) et le ${nouvelle.date_debut} (début de cette carte).`);
      }
    }
    const suivante = avec.filter(x => x.d > fin).sort((a, b) => a.d.getTime() - b.d.getTime())[0];
    if (suivante) {
      const n = Math.round((suivante.d.getTime() - fin.getTime()) / jourMs) - 1;
      if (n > 0) {
        messages.push(`${libelle(n)} sans carte entre le ${nouvelle.date_fin} (fin de cette carte) et le ${suivante.c.date_debut} (début de la carte suivante).`);
      }
    }
    return messages;
  }

  /** Niveau d'urgence de l'alerte selon le nombre de jours restants (négatif = expirée). */
  private niveau(jours: number): { icon: SweetAlertIcon; title: string; couleur: string } {
    if (jours < 0) return { icon: 'error', title: 'Carte CNAM expirée', couleur: '#dc3545' };
    if (jours <= SEUIL_CRITIQUE_JOURS) return { icon: 'error', title: 'Carte CNAM : expiration imminente', couleur: '#dc3545' };
    if (jours <= SEUIL_AVERTISSEMENT_JOURS) return { icon: 'warning', title: 'Carte CNAM bientôt expirée', couleur: '#f7b84b' };
    return { icon: 'info', title: 'Carte CNAM : pensez au renouvellement', couleur: '#299cdb' };
  }

  /**
   * Pop-up d'alerte sur la carte CNAM en cours (celle dont la date de fin est la plus récente).
   * Trois choix : voir les cartes, reporter l'alerte à demain, ou fermer.
   */
  notifier(cartes: any[], matricule: string): void {
    const courante = (cartes || [])
      .map(c => ({ carte: c, fin: this.parseDateFr(c.date_fin) }))
      .filter(x => x.fin)
      .sort((a, b) => b.fin!.getTime() - a.fin!.getTime())[0]?.carte;
    if (!courante) return;

    const jours = this.joursAvantFin(courante.date_fin) as number;
    if (jours > SEUIL_ALERTE_JOURS) return;

    const niveau = this.niveau(jours);
    const quand = jours === 0
      ? `expire aujourd'hui (${courante.date_fin})`
      : jours === 1
        ? `expire demain (${courante.date_fin})`
        : `expire dans ${jours} jours (le ${courante.date_fin})`;

    Swal.fire({
      icon: niveau.icon,
      title: niveau.title,
      text: jours < 0
        ? `Votre carte de soins CNAM a expiré le ${courante.date_fin}.`
        : `Votre carte de soins CNAM ${quand}.`,
      confirmButtonText: 'Voir mes cartes',
      confirmButtonColor: niveau.couleur,
      showDenyButton: true,
      denyButtonText: 'Me le rappeler demain',
      showCancelButton: true,
      cancelButtonText: 'Fermer',
    }).then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['/Adherent/MajAdherent1'], { queryParams: { mat: matricule } });
      } else if (result.isDenied) {
        this.reporterRappel(matricule);
      }
    });
  }

  /**
   * Vue RH / social : après le choix d'un matricule, avertit uniquement si sa carte CNAM en cours
   * (date de fin la plus récente) est expirée. Aucun message si la carte est valide ou s'il n'y a aucune carte.
   */
  verifierExpirationMatricule(matricule: string, codSoc?: string, nom?: string): void {
    if (!matricule) return;
    this.adherentServ.getCarteSoinCnamUtilisateur(String(matricule), codSoc || undefined).subscribe({
      next: cartes => {
        const courante = (cartes || [])
          .map(c => ({ carte: c, fin: this.parseDateFr(c.date_fin) }))
          .filter(x => x.fin)
          .sort((a, b) => b.fin!.getTime() - a.fin!.getTime())[0]?.carte;
        if (!courante || (this.joursAvantFin(courante.date_fin) as number) >= 0) return;

        const qui = nom ? `${matricule} (${nom})` : `${matricule}`;
        Swal.fire({
          icon: 'warning',
          title: 'Carte CNAM expirée',
          html: `La carte de soins CNAM du matricule <b>${qui}</b> a expiré le <b>${courante.date_fin}</b>.`,
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc3545',
        });
      },
      error: err => console.error('Carte CNAM : chargement impossible', err),
    });
  }

  /**
   * Charge les cartes CNAM de l'utilisateur connecté et affiche l'alerte si besoin.
   * Le compte est rattaché à l'adhérent par son matricule : `matPers` s'il est renseigné, sinon le login
   * (les comptes adhérents ont login = matricule). La société n'est utilisée que si elle est renseignée.
   */
  verifierPourUtilisateur(user: any): void {
    const matricule = user?.matPers || user?.useLogin;
    if (!matricule || this.rappelReporte(String(matricule))) return;
    this.adherentServ.getCarteSoinCnamUtilisateur(String(matricule), user?.codSoc || undefined).subscribe({
      next: cartes => this.notifier(cartes, String(matricule)),
      error: err => console.error('Carte CNAM : chargement impossible', err),
    });
  }
}
