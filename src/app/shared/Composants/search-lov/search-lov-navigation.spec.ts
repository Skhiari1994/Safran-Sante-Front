import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EtatNavigation, NavigationFicheService } from '../../Service/navigation-fiche.service';
import { SaveService } from '../../Service/save.service';
import { SearchLovComponent } from './search-lov.component';

/**
 * Écran factice qui fait comme les vrais écrans : la fenêtre de sélection est sous `*ngIf="isSearch"`, et `isSearch`
 * suit la recherche de la barre d'outils. Sur certains écrans `isSearch` reste vrai en permanence (`forcer`).
 */
@Component({
  template: `<div *ngIf="isSearch"><app-search-lov [listData]="liste" [columns]="colonnes" (selectedValue)="choisi($event)"></app-search-lov></div>`,
})
class EcranFacticeComponent {
  isSearch = false;
  forcer = false;
  recus: any[] = [];
  colonnes = [{ key: 'mat_pers', label: 'Matricule' }, { key: 'nom', label: 'Nom' }];
  liste = ['1', '10', '1000', '10000', '1001', '1002', '2'].map(m => ({ mat_pers: m, nom: 'nom ' + m }));

  constructor(save: SaveService) {
    save.isSearch$.subscribe(v => (this.isSearch = this.forcer ? true : v));
  }

  choisi(item: any): void {
    this.recus.push(item);
  }
}

const attendre = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

describe('navigation entre les fiches : avec la vraie fenêtre de sélection', () => {
  let fixture: ComponentFixture<EcranFacticeComponent>;
  let ecran: EcranFacticeComponent;
  let save: SaveService;
  let nav: NavigationFicheService;
  let etat: EtatNavigation | null;

  const lov = () => fixture.debugElement.query(By.directive(SearchLovComponent));
  const modaleOuverte = () => !!document.querySelector('ngb-modal-window');

  async function actualiser(ms = 60) {
    await attendre(ms);
    fixture.detectChanges();
  }

  /** Clique sur la ligne du tableau de la fenêtre : même chemin que l'utilisateur (sélection puis fermeture). */
  async function choisirLigne(matricule: string) {
    const lignes = Array.from(document.querySelectorAll('ngb-modal-window tbody tr')) as HTMLElement[];
    const ligne = lignes.find(l => (l.textContent ?? '').includes('nom ' + matricule) && (l.textContent ?? '').trim().startsWith(matricule));
    expect(ligne).toBeTruthy();
    ligne!.click();
    await actualiser();
  }

  async function ouvrirEtChoisir(matricule: string) {
    save.setIsSearch(true);                // la loupe de la barre d'outils
    fixture.detectChanges();
    await actualiser(350);                 // la fenêtre attend son modèle, puis s'ouvre
    expect(modaleOuverte()).toBeTrue();
    await choisirLigne(matricule);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EcranFacticeComponent, SearchLovComponent],
      imports: [CommonModule, FormsModule, NgbModule, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
    fixture = TestBed.createComponent(EcranFacticeComponent);
    ecran = fixture.componentInstance;
    save = TestBed.inject(SaveService);
    nav = TestBed.inject(NavigationFicheService);
    save.setIsSearch(false);
    nav.effacer();
    etat = null;
    nav.etat$.subscribe(e => (etat = e));
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.inject(NgbModal).dismissAll();
    save.setIsSearch(false);
    nav.effacer();
  });

  it('la fenêtre est bien détruite après le choix (comme dans les vrais écrans) mais la position est gardée', async () => {
    await ouvrirEtChoisir('1000');
    expect(ecran.recus.map(r => r.mat_pers)).toEqual(['1000']);
    expect(lov()).toBeNull();                       // détruite par le *ngIf
    expect(etat!.position).toBe(4);                  // ordre numérique : 1, 2, 10, 1000, 1001, 1002, 10000
    expect(etat!.total).toBe(7);
    expect(etat!.filtre).toBeFalse();
    expect(etat!.code).toBe('1000');                // le matricule seul suffit : il est unique
    expect(etat!.detail).toBe('Matricule 1000');
  });

  it('▶ charge la fiche suivante dans l\'ordre numérique, sans ouvrir la fenêtre', async () => {
    await ouvrirEtChoisir('1000');
    ecran.recus.length = 0;

    nav.demander('suivant');
    fixture.detectChanges();
    await actualiser();

    expect(ecran.recus.map(r => r.mat_pers)).toEqual(['1001']);   // et non 10000
    expect(etat!.code).toBe('1001');
    expect(etat!.position).toBe(5);
    expect(modaleOuverte()).toBeFalse();
    expect(ecran.isSearch).toBeFalse();                           // la recherche est rendue à son état normal
    expect(lov()).toBeNull();
  });

  it('enchaîne ▶ ▶ ◀ puis ⏮ et ⏭ avec les bornes', async () => {
    await ouvrirEtChoisir('1000');
    ecran.recus.length = 0;
    for (const sens of ['suivant', 'suivant', 'precedent', 'premier', 'precedent', 'dernier', 'suivant'] as const) {
      nav.demander(sens);
      fixture.detectChanges();
      await actualiser();
    }
    // 1000 -> 1001 -> 1002 -> 1001 -> 1 -> (déjà au début : rien) -> 10000 -> (déjà à la fin : rien)
    expect(ecran.recus.map(r => r.mat_pers)).toEqual(['1001', '1002', '1001', '1', '10000']);
    expect(etat!.position).toBe(7);
    expect(etat!.total).toBe(7);
    expect(etat!.code).toBe('10000');
  });

  it('fonctionne aussi quand l\'écran garde la fenêtre en permanence (isSearch toujours vrai)', async () => {
    ecran.forcer = true;
    await ouvrirEtChoisir('1000');
    expect(lov()).not.toBeNull();                   // jamais détruite
    ecran.recus.length = 0;

    nav.demander('suivant');
    fixture.detectChanges();
    await actualiser();

    expect(ecran.recus.map(r => r.mat_pers)).toEqual(['1001']);
    expect(etat!.code).toBe('1001');
    expect(modaleOuverte()).toBeFalse();
  });

  it('une recherche normale rouvre la fenêtre (aucune demande ne reste en attente)', async () => {
    await ouvrirEtChoisir('1000');
    nav.demander('suivant');
    fixture.detectChanges();
    await actualiser();
    expect(modaleOuverte()).toBeFalse();

    save.setIsSearch(true);                         // la loupe, une fois la navigation terminée
    fixture.detectChanges();
    await actualiser(350);
    expect(modaleOuverte()).toBeTrue();
  });

  it('s\'arrête sans rien charger si la fiche affichée a disparu de la liste', async () => {
    await ouvrirEtChoisir('1000');
    ecran.liste = ecran.liste.filter(l => l.mat_pers !== '1000');   // supprimée entre-temps
    ecran.recus.length = 0;

    nav.demander('suivant');
    fixture.detectChanges();
    await actualiser();

    expect(ecran.recus).toEqual([]);
    expect(etat).toBeNull();                         // les boutons se grisent
  });

  it('« Nouveau » efface la position', async () => {
    await ouvrirEtChoisir('1000');
    save.setAdded(true);
    expect(etat).toBeNull();
    nav.demander('suivant');                         // sans effet : plus de fiche courante
    fixture.detectChanges();
    await actualiser();
    expect(modaleOuverte()).toBeFalse();
    expect(ecran.isSearch).toBeFalse();
  });
});
