import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AuthenticationService } from './auth.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { memoriserMotifDeconnexion } from '../helpers/motif-deconnexion';

/** Inactivité tolérée avant l'affichage de l'avertissement. */
export const DELAI_INACTIVITE_MS = 3 * 60 * 1000;
/** Durée pendant laquelle l'avertissement reste affiché avant la déconnexion. */
export const DELAI_AVERTISSEMENT_MS = 2 * 60 * 1000;

/**
 * Le jeton du serveur est court (7 min) : tant que l'utilisateur est actif, on le renouvelle au plus une fois par
 * minute. Quand il est inactif on ne renouvelle plus, donc la session meurt aussi côté serveur.
 */
export const INTERVALLE_RENOUVELLEMENT_MS = 60 * 1000;

/** Dernière activité, partagée entre les onglets (un onglet actif ne doit pas être déconnecté par un onglet inactif). */
const CLE_ACTIVITE = 'derniereActivite';
const ID_COMPTEUR = 'session-compteur';
const RAYON_ANNEAU = 52;
const CIRCONFERENCE = 2 * Math.PI * RAYON_ANNEAU;

/**
 * Déconnexion automatique après inactivité :
 *  - après 3 min sans activité, un pop-up prévient l'utilisateur ;
 *  - « OK » dans les 2 min : la session continue ;
 *  - sinon : déconnexion et retour à l'écran d'authentification.
 *
 * Les échéances sont calculées sur l'horloge (Date.now) et non avec un simple setTimeout, pour rester
 * justes si l'onglet est mis en arrière-plan ou si le poste se met en veille.
 */
@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  /** Surchargeables (tests) ; valeurs de production par défaut. */
  delaiInactivite = DELAI_INACTIVITE_MS;
  delaiAvertissement = DELAI_AVERTISSEMENT_MS;
  /** Fréquence de vérification (ms). */
  periodeVerification = 1000;
  /** Délai minimal entre deux renouvellements du jeton (ms). */
  intervalleRenouvellement = INTERVALLE_RENOUVELLEMENT_MS;

  // horloge du navigateur uniquement (l'iat du jeton est à l'heure du serveur, qui peut différer)
  private dernierRenouvellement = 0;
  private renouvellementEnCours = false;
  private actif = false;
  private derniereActivite = Date.now();
  private debutAvertissement: number | null = null;
  private minuteur?: ReturnType<typeof setInterval>;
  private derniereEcriture = 0;

  private readonly evenements = ['mousemove', 'mousedown', 'click', 'keydown', 'wheel', 'touchstart', 'scroll'];
  private readonly surActivite = () => this.enregistrerActivite();

  constructor(
    private zone: NgZone,
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthenticationService,
    private tokenStorage: TokenStorage,
  ) { }

  /** À appeler quand l'utilisateur est connecté. Sans effet si déjà démarré. */
  demarrer(): void {
    if (this.actif) return;
    this.actif = true;
    this.debutAvertissement = null;
    this.dernierRenouvellement = 0; // la 1re activité renouvelle : le jeton a pu vieillir pendant un rechargement
    this.derniereActivite = Date.now();
    this.ecrireActivite(this.derniereActivite);

    // hors zone Angular : mousemove/scroll ne doivent pas déclencher de détection de changements
    this.zone.runOutsideAngular(() => {
      this.evenements.forEach(e => document.addEventListener(e, this.surActivite, { passive: true, capture: true }));
      this.minuteur = setInterval(() => this.verifier(), this.periodeVerification);
    });
  }

  /** À appeler quand l'utilisateur quitte l'application (déconnexion, destruction du layout). */
  arreter(): void {
    if (!this.actif) return;
    this.actif = false;
    this.evenements.forEach(e => document.removeEventListener(e, this.surActivite, true));
    if (this.minuteur) clearInterval(this.minuteur);
    this.minuteur = undefined;
    this.debutAvertissement = null;
    if (Swal.isVisible() && Swal.getPopup()?.classList.contains('popup-inactivite')) Swal.close();
  }

  private enregistrerActivite(): void {
    // pendant l'avertissement, seul le bouton OK prolonge la session
    if (this.debutAvertissement !== null) return;
    const maintenant = Date.now();
    this.derniereActivite = maintenant;
    // l'écriture dans le stockage partagé est limitée à une par seconde
    if (maintenant - this.derniereEcriture >= 1000) this.ecrireActivite(maintenant);
    this.renouvelerJeton(false);
  }

  /** Demande un jeton neuf au serveur (au plus un appel à la fois, et un par intervalle sauf `forcer`). */
  private renouvelerJeton(forcer: boolean): void {
    if (this.renouvellementEnCours) return;
    const maintenant = Date.now();
    if (!forcer && maintenant - this.dernierRenouvellement < this.intervalleRenouvellement) return;
    this.renouvellementEnCours = true;
    // on note la tentative tout de suite : en cas d'échec réseau on ne réessaie pas à chaque mouvement de souris
    this.dernierRenouvellement = maintenant;
    this.authService.renouvelerJeton().subscribe({
      next: () => { this.renouvellementEnCours = false; },
      // 401 : le ErrorInterceptor déconnecte déjà l'utilisateur ; autre erreur : on réessaiera à l'intervalle suivant
      error: () => { this.renouvellementEnCours = false; },
    });
  }

  private ecrireActivite(valeur: number): void {
    this.derniereEcriture = valeur;
    try { localStorage.setItem(CLE_ACTIVITE, String(valeur)); } catch { /* stockage indisponible */ }
  }

  private lireActiviteAutreOnglet(): number {
    try { return Number(localStorage.getItem(CLE_ACTIVITE)) || 0; } catch { return 0; }
  }

  private verifier(): void {
    // déconnecté depuis un autre onglet : on suit
    if (!this.tokenStorage.getToken()) {
      this.finDeSession(false);
      return;
    }

    const maintenant = Date.now();
    const partagee = this.lireActiviteAutreOnglet();
    if (partagee > this.derniereActivite) this.derniereActivite = partagee;

    if (this.debutAvertissement === null) {
      if (maintenant - this.derniereActivite >= this.delaiInactivite) this.afficherAvertissement(maintenant);
      return;
    }

    // avertissement affiché : prolongé depuis un autre onglet ?
    if (this.derniereActivite > this.debutAvertissement) {
      this.debutAvertissement = null;
      Swal.close();
      return;
    }

    const restant = this.debutAvertissement + this.delaiAvertissement - maintenant;
    if (restant <= 0) {
      this.finDeSession(true);
    } else {
      this.majAffichage(restant);
    }
  }

  private afficherAvertissement(maintenant: number): void {
    this.debutAvertissement = maintenant;
    Swal.fire({
      title: 'Session inactive',
      html: `<div class="inact">
               <div class="inact__anneau">
                 <svg viewBox="0 0 120 120" aria-hidden="true">
                   <circle class="inact__piste" cx="60" cy="60" r="${RAYON_ANNEAU}"></circle>
                   <circle class="inact__progres" cx="60" cy="60" r="${RAYON_ANNEAU}"
                           stroke-dasharray="${CIRCONFERENCE}" stroke-dashoffset="0"></circle>
                 </svg>
                 <div class="inact__temps">
                   <span id="${ID_COMPTEUR}">${this.formater(this.delaiAvertissement)}</span>
                   <small>avant déconnexion</small>
                 </div>
               </div>
               <p class="inact__message">Pour des raisons d'inactivité, votre session sera déconnectée.</p>
               <p class="inact__aide">Cliquez sur <strong>OK</strong> pour rester connecté.</p>
             </div>`,
      confirmButtonText: 'OK',
      buttonsStyling: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: true,
      width: 440,
      customClass: {
        popup: 'popup-inactivite',
        title: 'inact-titre',
        confirmButton: 'btn btn-primary btn-lg px-5',
      },
    }).then(result => {
      if (result.isConfirmed) {
        // l'utilisateur reste connecté : l'inactivité repart de zéro
        this.debutAvertissement = null;
        this.derniereActivite = Date.now();
        this.ecrireActivite(this.derniereActivite);
        this.renouvelerJeton(true); // le jeton a pu approcher de son échéance pendant l'avertissement
      }
    });
  }

  /** Met à jour le temps restant et l'anneau ; passe en « urgent » (rouge) sur le dernier quart du délai. */
  private majAffichage(restant: number): void {
    const conteneur = Swal.getHtmlContainer();
    if (!conteneur) return;
    const compteur = conteneur.querySelector('#' + ID_COMPTEUR);
    if (compteur) compteur.textContent = this.formater(restant);
    const progres = conteneur.querySelector<SVGCircleElement>('.inact__progres');
    const part = Math.min(1, Math.max(0, restant / this.delaiAvertissement));
    progres?.setAttribute('stroke-dashoffset', String(CIRCONFERENCE * (1 - part)));
    conteneur.querySelector('.inact')?.classList.toggle('inact--urgent', part <= 0.25);
  }

  /** Nettoie la session puis renvoie vers l'écran d'authentification. */
  private finDeSession(deconnecter: boolean): void {
    this.arreter();
    Swal.close();
    this.zone.run(() => {
      this.modalService.dismissAll();
      if (deconnecter) {
        memoriserMotifDeconnexion('inactivite');
        this.authService.logout();
        try { localStorage.removeItem(CLE_ACTIVITE); } catch { /* ignoré */ }
      }
      this.router.navigate(['/auth/login']);
    });
  }

  private formater(ms: number): string {
    const secondes = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(secondes / 60).toString().padStart(2, '0');
    const s = (secondes % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
