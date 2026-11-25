import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ContexteNavigation, SensNavigation } from '../navigation-liste';
import { SaveService } from './save.service';

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

  constructor(private saveService: SaveService, router: Router) {
    // « Nouveau » ou « Retour » : il n'y a plus de fiche courante
    this.saveService.add$.subscribe(v => {
      if (v) this.effacer();
    });
    // autre écran : la liste parcourue n'existe plus
    router.events.subscribe(e => {
      if (e instanceof NavigationStart) this.effacer();
    });
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
    const cible = event.target as HTMLElement | null;
    if (!cible || typeof cible.closest !== 'function') return;
    if (!cible.closest('.main-content') || cible.closest('.modal')) return;
    this.modifie = true;
  }
}
