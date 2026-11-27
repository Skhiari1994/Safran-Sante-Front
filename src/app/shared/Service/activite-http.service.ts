import { Injectable } from '@angular/core';

/** Délai sans aucune lecture en cours au-delà duquel une liste encore vide est considérée comme vraiment vide. */
export const CALME_MS = 1500;

/**
 * Lectures (GET) en cours vers le serveur. Les fenêtres de recherche s'en servent : tant qu'une lecture est en route
 * (ou vient de se terminer : un écran enchaîne souvent plusieurs lectures) et que leur liste n'est pas encore
 * arrivée, elles affichent « Chargement de la liste… » au lieu de « Aucun résultat ».
 */
@Injectable({ providedIn: 'root' })
export class ActiviteHttpService {
  private lectures = 0;
  private derniereFin = 0;

  get lecturesEnCours(): number {
    return this.lectures;
  }

  /** Une lecture est en cours, ou la dernière s'est terminée il y a moins de CALME_MS. */
  get actif(): boolean {
    return this.lectures > 0 || Date.now() - this.derniereFin < CALME_MS;
  }

  debut(): void {
    this.lectures++;
  }

  fin(): void {
    this.lectures = Math.max(0, this.lectures - 1);
    this.derniereFin = Date.now();
  }
}
