import { Directive, ElementRef, EventEmitter, HostListener, NgZone, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { champsSaisissables, focaliser, focusCaseLigne } from './focus-nouvelle-ligne';

/**
 * Saisie au clavier dans un tableau PrimeNG en édition par ligne (tableaux des bulletins) :
 * - Entrée / Tab : case suivante ; Maj+Entrée / Maj+Tab : case précédente (cases à cocher et champs en lecture seule sautés) ;
 * - en bout de ligne, passage à la ligne voisine, mise en édition si besoin (et changement de page si nécessaire) ;
 * - Entrée sur la dernière case de la dernière ligne : nouvelle ligne (Tab, lui, sort du tableau normalement) ;
 * - Alt+N : nouvelle ligne dans le tableau affiché (onglet actif), sauf si une fenêtre est ouverte.
 *
 * Usage : <p-table appNavigationClavier (ajouterLigne)="addLigne()" ...>
 */
@Directive({
  selector: 'p-table[appNavigationClavier]',
  standalone: true,
})
export class NavigationClavierDirective implements OnInit, OnDestroy {
  /** Demande d'ajout d'une ligne (Alt+N, ou Entrée sur la dernière case du tableau). */
  @Output() ajouterLigne = new EventEmitter<void>();

  private readonly table = inject(Table);
  private readonly hote = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly ecouteur = (ev: KeyboardEvent) => this.surTouche(ev);

  ngOnInit(): void {
    // phase de capture : passe avant la gestion Tab / Entrée des cellules PrimeNG (pEditableColumn)
    this.hote.nativeElement.addEventListener('keydown', this.ecouteur, true);
  }

  ngOnDestroy(): void {
    this.hote.nativeElement.removeEventListener('keydown', this.ecouteur, true);
  }

  /** Alt+N n'importe où dans la page, pour le tableau visible (un seul par onglet). */
  @HostListener('document:keydown', ['$event'])
  surRaccourci(ev: KeyboardEvent): void {
    if (!ev.altKey || ev.ctrlKey || ev.metaKey || (ev.key || '').toLowerCase() !== 'n') return;
    if (this.hote.nativeElement.getClientRects().length === 0) return;          // onglet non affiché
    if (document.querySelector('.modal.show, ngb-modal-window')) return;        // une fenêtre est ouverte
    ev.preventDefault();
    this.zone.run(() => this.ajouterLigne.emit());
  }

  private surTouche(ev: KeyboardEvent): void {
    if (ev.key !== 'Enter' && ev.key !== 'Tab') return;
    if (ev.ctrlKey || ev.altKey || ev.metaKey || ev.isComposing) return;
    const champ = ev.target as HTMLElement;
    if (!champ.matches?.('input, select, textarea') || champ.tagName === 'TEXTAREA') return;
    const ligne = champ.closest('tr');
    const corps = ligne?.parentElement;
    if (!ligne || !corps?.classList.contains('p-datatable-tbody')) return;

    const sens = ev.shiftKey ? -1 : 1;
    const champs = champsSaisissables(ligne);
    const ici = champs.indexOf(champ);

    // 1) case voisine dans la même ligne
    const voisin = ici >= 0 ? champs[ici + sens] : undefined;
    if (voisin) {
      this.bloquer(ev);
      focaliser(voisin);
      return;
    }

    // 2) ligne voisine (dans toutes les données, pas seulement la page affichée)
    const lignesPage = Array.from(corps.children);
    const debutPage = this.table.paginator ? (this.table.first || 0) : 0;
    const indexLigne = debutPage + lignesPage.indexOf(ligne);
    const donnees: any[] = (this.table.value as any[]) || [];
    const cible = indexLigne + sens;

    if (cible >= 0 && cible < donnees.length) {
      this.bloquer(ev);
      const ligneCible = lignesPage[cible - debutPage];
      const champsCible = champsSaisissables(ligneCible);
      if (champsCible.length) {
        focaliser(sens > 0 ? champsCible[0] : champsCible[champsCible.length - 1]);
      } else {
        // ligne affichée sans ses champs (pas en édition) ou sur une autre page : on la met en édition
        this.zone.run(() => this.table.initRowEdit(donnees[cible]));
        focusCaseLigne(this.table, cible, sens < 0);
      }
      return;
    }

    // 3) bout du tableau : Entrée sur la dernière case ajoute une ligne ; Tab sort du tableau (comportement normal)
    if (sens > 0 && ev.key === 'Enter') {
      this.bloquer(ev);
      this.zone.run(() => this.ajouterLigne.emit());
    } else if (ev.key === 'Enter') {
      this.bloquer(ev);
    }
  }

  private bloquer(ev: KeyboardEvent): void {
    ev.preventDefault();
    ev.stopPropagation();
  }
}
