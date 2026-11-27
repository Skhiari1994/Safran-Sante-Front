import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Barre de pagination des fenêtres « Sélectionnez une valeur » (app-lov et app-search-lov) :
 * lignes par page, première / précédente / numéros / suivante / dernière, « Page x / n ».
 * Les pages sont numérotées à partir de 0 ; la fenêtre parente change de page et fournit les lignes.
 */
@Component({
  selector: 'app-lov-pagination',
  templateUrl: './lov-pagination.component.html',
  styleUrls: ['./lov-pagination.component.scss'],
})
export class LovPaginationComponent {
  /** Page affichée (0 = première). */
  @Input() page = 0;
  /** Nombre total de lignes (toutes pages). */
  @Input() total = 0;
  @Input() taille = 50;
  @Input() tailles: number[] = [25, 50, 100];
  /** Pendant un chargement : boutons inactifs (un seul changement de page à la fois). */
  @Input() desactive = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() tailleChange = new EventEmitter<number>();

  get nbPages(): number {
    return Math.max(1, Math.ceil(this.total / (this.taille || 1)));
  }

  /** Numéros proposés : la première, la dernière, et deux de chaque côté de la page affichée (null = « … »). */
  get pagesVisibles(): (number | null)[] {
    const n = this.nbPages;
    const c = this.page;
    const pages: (number | null)[] = [];
    for (let i = 0; i < n; i++) {
      if (i === 0 || i === n - 1 || Math.abs(i - c) <= 2) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== null) {
        pages.push(null);
      }
    }
    return pages;
  }

  aller(page: number): void {
    const cible = Math.min(Math.max(page, 0), this.nbPages - 1);
    if (cible !== this.page && !this.desactive) this.pageChange.emit(cible);
  }

  changerTaille(taille: number | string): void {
    this.tailleChange.emit(Number(taille) || 50);
  }

  /** 6678 → « 6 678 ». */
  nombre(n: number): string {
    return (n ?? 0).toLocaleString('fr-FR');
  }
}
