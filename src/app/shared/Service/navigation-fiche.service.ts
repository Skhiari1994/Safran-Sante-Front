import { Injectable, inject } from '@angular/core';
import { ActivationEnd, CanDeactivateFn, NavigationEnd, Route, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { ContexteNavigation, SensNavigation } from '../navigation-liste';
import { SaveService } from './save.service';
import { suivreSwal } from '../swal-suivi';

/**
 * Posé automatiquement sur chaque écran affiché : quitter l'écran (menu, lien, bouton Précédent du navigateur)
 * alors que la fiche a été modifiée sans être enregistrée demande confirmation.
 */
export const ficheModifieeGuard: CanDeactivateFn<unknown> = () =>
  inject(NavigationFicheService).confirmerAbandon('ecran');

/** Action qui ferait perdre la fiche modifiée. */
export type ActionAbandon = 'fiche' | 'ecran' | 'formulaire' | 'deconnexion';

/** Pour chaque action : ce qui sera perdu, et le bouton qui le dit clairement (pas un simple « Oui »). */
const TEXTES_ABANDON: Record<ActionAbandon, { consequence: string; bouton: string }> = {
  fiche: { consequence: 'Si vous passez à une autre fiche, ces modifications seront perdues.', bouton: 'Changer sans enregistrer' },
  ecran: { consequence: 'Si vous quittez cet écran, ces modifications seront perdues.', bouton: 'Quitter sans enregistrer' },
  formulaire: { consequence: 'Si vous videz le formulaire, ces modifications seront perdues.', bouton: 'Vider sans enregistrer' },
  deconnexion: { consequence: 'Si vous vous déconnectez, ces modifications seront perdues.', bouton: 'Se déconnecter quand même' },
};


/** Champs de recherche et de filtre : y taper ne modifie pas la fiche. */
const HORS_FICHE = [
  '.modal', '.search-box', '[role="search"]', '.p-datatable-header', '.p-column-filter', '.p-paginator',
  'p-tablecheckbox', 'p-tableheadercheckbox', '[data-sans-avertissement]',
].join(', ');

/** Ce que la barre d'outils affiche : où l'on en est dans la liste de la dernière sélection faite avec la loupe. */
export interface EtatNavigation {
  /** Position de la fiche affichée, à partir de 1. */
  position: number;
  total: number;
  /** true si la liste parcourue est le résultat d'un filtre (et non toute la liste). */
  filtre: boolean;
  /** Valeurs qui identifient la fiche affichée : le matricule seul s'il est unique, sinon « 202622 · 1234 · 0 »… */
  code: string;
  /** Les mêmes valeurs avec le nom de leur colonne, pour l'infobulle. */
  detail: string;
}

export interface DemandeNavigation {
  sens: SensNavigation;
  contexte: ContexteNavigation;
}

/** Une demande de déplacement non prise en charge au bout de ce délai est abandonnée (pas de fenêtre pour la traiter). */
const DELAI_DEMANDE_MS = 3000;

/**
 * Relie la barre d'outils (boutons ⏮ ◀ ▶ ⏭) à la fenêtre de sélection de l'écran affiché.
 *
 * Les écrans détruisent la fenêtre de sélection dès qu'une ligne est choisie (`*ngIf="isSearch"`) : la position est donc
 * conservée ici, et non dans la fenêtre. Un clic sur un bouton dépose une demande puis réveille la recherche
 * (`SaveService.setIsSearch(true)`) : la fenêtre, recréée à cet instant, voit la demande, émet la fiche voulue comme un
 * clic sur une ligne le ferait, et ne s'ouvre pas. Aucun écran n'a besoin de le savoir.
 */
@Injectable({ providedIn: 'root' })
export class NavigationFicheService {

  private etatSubject = new BehaviorSubject<EtatNavigation | null>(null);
  readonly etat$ = this.etatSubject.asObservable();

  private contexte: ContexteNavigation | null = null;
  private enAttente: DemandeNavigation | null = null;

  /**
   * true si l'utilisateur a saisi quelque chose depuis le dernier chargement de fiche ou le dernier enregistrement.
   * Seules les vraies saisies comptent (pas le remplissage du formulaire par le programme) : pas de faux avertissement.
   */
  modifie = false;

  /** Écran de consultation : rien n'y est enregistrable, donc rien à perdre. */
  private consultation = false;
  /** Fenêtre de confirmation déjà affichée : les demandes simultanées attendent la même réponse. */
  private confirmationEnCours: Promise<boolean> | null = null;
  /** L'écran affiché a sa propre confirmation de sortie (et marque lui-même ses champs modifiés). */
  private protectionPropre = false;

  constructor(private saveService: SaveService, router: Router) {
    // « Nouveau » ou « Retour » : il n'y a plus de fiche courante
    this.saveService.add$.subscribe(v => {
      if (v) this.effacer();
    });
    this.saveService.consultation$.subscribe(v => (this.consultation = v));
    router.events.subscribe(e => {
      // chaque écran affiché reçoit la confirmation de sortie (sauf s'il a déjà la sienne)
      if (e instanceof ActivationEnd && !e.snapshot.firstChild && e.snapshot.routeConfig) {
        this.protegerSortie(e.snapshot.routeConfig);
      }
      // autre écran : la liste parcourue n'existe plus. Effacé une fois le changement fait (et non à son début) :
      // la confirmation de sortie doit encore savoir que la fiche était modifiée
      if (e instanceof NavigationEnd) this.effacer();
    });
    // écran déjà affiché quand ce service est créé (premier écran après une actualisation de la page) :
    // son ActivationEnd est passé avant, il faut le protéger ici
    let feuille = router.routerState.snapshot.root;
    while (feuille.firstChild) feuille = feuille.firstChild;
    if (feuille.routeConfig) this.protegerSortie(feuille.routeConfig);

    // fermeture ou actualisation de l'onglet : message standard du navigateur (son texte ne peut pas être changé)
    window.addEventListener('beforeunload', ev => this.surFermetureOnglet(ev));
    this.suivreChampsModifies();
    this.suivreEnregistrementsReussis();
  }

  /**
   * Écrans qui enregistrent avec leur propre bouton (pas celui de la barre d'outils) : ils annoncent la réussite par
   * une fenêtre de succès. On la repère pour ne pas avertir à tort en quittant une fiche déjà enregistrée.
   * Une suppression ou un téléchargement réussis ne valent pas enregistrement de la fiche.
   */
  private suivreEnregistrementsReussis(): void {
    this.arreterSuiviSwal?.();
    this.arreterSuiviSwal = suivreSwal(args => this.noterFenetre(args));
  }
  private arreterSuiviSwal?: () => void;

  /** Fenêtre SweetAlert affichée : une fenêtre de succès d'enregistrement remet la fiche à « non modifiée ». */
  noterFenetre(args: any[]): void {
    const [a, b, c] = args;
    let texte: string | null = null;
    if (a && typeof a === 'object') {
      if (a.icon === 'success') texte = `${a.title ?? ''} ${a.text ?? ''} ${a.html ?? ''}`;
    } else if (c === 'success') {
      texte = `${a ?? ''} ${b ?? ''}`;
    }
    if (texte !== null && !/supprim|delet|t[ée]l[ée]charg|pr[ée]par[ée]|copi/i.test(texte)) {
      this.modifie = false;
    }
  }

  /** Valeur choisie par l'utilisateur dans une fenêtre de recherche d'un champ (loupe) : la fiche est modifiée. */
  signalerChoix(champ: HTMLElement): void {
    if (this.estChampDeFiche(champ)) this.modifie = true;
  }

  /**
   * Modifications faites autrement qu'au clavier (liste déroulante, calendrier, case à cocher…) : Angular ajoute la
   * classe ng-dirty à un champ quand l'utilisateur change sa valeur, jamais quand le programme le remplit.
   */
  private suivreChampsModifies(): void {
    if (typeof MutationObserver === 'undefined') return;
    new MutationObserver(mutations => {
      if (this.modifie || this.protectionPropre) return;
      for (const m of mutations) {
        const el = m.target as HTMLElement;
        if (el.classList?.contains('ng-dirty') && !(m.oldValue || '').includes('ng-dirty') && this.estChampDeFiche(el)) {
          this.modifie = true;
          return;
        }
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  }

  /** Champ de la fiche affichée (et non barre d'en-tête, fenêtre, recherche ou filtre). */
  private estChampDeFiche(cible: HTMLElement): boolean {
    if (!cible || typeof cible.closest !== 'function') return false;
    if (cible.tagName === 'FORM' || cible.hasAttribute('formgroupname') || cible.hasAttribute('formarrayname')) return false;
    if (!cible.closest('.main-content') || cible.closest(HORS_FICHE)) return false;
    if (cible instanceof HTMLInputElement && (cible.type === 'search' || /^rechercher/i.test(cible.placeholder || ''))) return false;
    return true;
  }

  /** Fermeture ou actualisation de l'onglet : le navigateur demande confirmation si la fiche a été modifiée. */
  surFermetureOnglet(ev: BeforeUnloadEvent): void {
    if (this.aDesModificationsAPerdre()) {
      ev.preventDefault();
      ev.returnValue = '';
    }
  }

  private protegerSortie(route: Route): void {
    if (!route.canDeactivate || route.canDeactivate.length === 0) {
      route.canDeactivate = [ficheModifieeGuard];
    }
    this.protectionPropre = !route.canDeactivate.includes(ficheModifieeGuard);
  }

  /** Utilisateur connecté (une déconnexion forcée, inactivité ou session expirée, ne doit jamais être bloquée). */
  private estConnecte(): boolean {
    try {
      return !!localStorage.getItem('token');
    } catch {
      return false;
    }
  }

  private aDesModificationsAPerdre(): boolean {
    return this.modifie && !this.consultation && this.estConnecte();
  }

  /**
   * Avant une action qui fait perdre la fiche en cours (autre fiche, autre écran, Retour, Nouveau, déconnexion) :
   * true si on peut continuer (rien à perdre, ou l'utilisateur confirme), false s'il préfère rester sur la fiche.
   */
  confirmerAbandon(action: ActionAbandon = 'fiche'): Promise<boolean> {
    if (!this.aDesModificationsAPerdre()) return Promise.resolve(true);
    if (!this.confirmationEnCours) {
      const { consequence, bouton } = TEXTES_ABANDON[action];
      this.confirmationEnCours = Swal.fire({
        title: 'Modifications non enregistrées',
        icon: 'warning',
        iconHtml: '<i class="ri-file-edit-line" aria-hidden="true"></i>',
        html: `<div class="abandon">
                 <p class="abandon__message">Vous avez modifié cette fiche sans l'enregistrer.</p>
                 <p class="abandon__consequence"><i class="ri-error-warning-line" aria-hidden="true"></i><span>${consequence}</span></p>
               </div>`,
        showCancelButton: true,
        // bouton recommandé (rester) à droite, en bouton principal, et sélectionné : Entrée ou Échap ne font rien perdre
        reverseButtons: false,
        focusCancel: true,
        buttonsStyling: false,
        confirmButtonText: bouton,
        cancelButtonText: '<i class="ri-arrow-go-back-line align-bottom me-1" aria-hidden="true"></i>Rester sur la fiche',
        customClass: {
          popup: 'popup-abandon',
          icon: 'abandon-icone',
          title: 'abandon-titre',
          htmlContainer: 'abandon-contenu',
          actions: 'abandon-actions',
          confirmButton: 'btn btn-outline-danger px-4',
          cancelButton: 'btn btn-primary px-4',
        },
      }).then(reponse => {
        this.confirmationEnCours = null;
        // l'utilisateur accepte de perdre ses saisies : pas de seconde question pour la même action
        if (reponse.isConfirmed) this.modifie = false;
        return !!reponse.isConfirmed;
      });
    }
    return this.confirmationEnCours;
  }

  /** Une fiche vient d'être chargée : nouvelle position, plus aucune modification en attente. */
  publier(contexte: ContexteNavigation, etat: EtatNavigation): void {
    this.contexte = contexte;
    this.modifie = false;
    this.etatSubject.next(etat);
  }

  effacer(): void {
    this.contexte = null;
    this.enAttente = null;
    this.modifie = false;
    if (this.etatSubject.value !== null) this.etatSubject.next(null);
  }

  /** Demande un déplacement : la fenêtre de sélection de l'écran le réalisera. */
  demander(sens: SensNavigation): void {
    if (!this.contexte) return;
    const demande: DemandeNavigation = { sens, contexte: this.contexte };
    this.enAttente = demande;
    this.saveService.setIsSearch(true);
    setTimeout(() => {
      if (this.enAttente === demande) {
        // personne ne l'a prise : on rend la recherche à son état normal
        this.enAttente = null;
        this.saveService.setIsSearch(false);
      }
    }, DELAI_DEMANDE_MS);
  }

  /** Appelé par la fenêtre de sélection quand la recherche s'active : lui remet la demande en attente, une seule fois. */
  prendreDemande(): DemandeNavigation | null {
    const demande = this.enAttente;
    this.enAttente = null;
    return demande;
  }

  /** À appeler quand l'utilisateur lance un enregistrement : plus rien en attente. */
  marquerEnregistre(): void {
    this.modifie = false;
  }

  /**
   * Retient une saisie de l'utilisateur dans la page (hors fenêtres modales et hors barre d'en-tête).
   * `isTrusted` écarte les événements fabriqués par le programme.
   */
  signalerSaisie(event: Event): void {
    if (!event.isTrusted) return;
    if (this.estChampDeFiche(event.target as HTMLElement)) this.modifie = true;
  }
}
