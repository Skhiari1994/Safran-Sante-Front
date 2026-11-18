import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconPickerComponent } from './icon-picker.component';

@Component({
  template: `<app-icon-picker [formControl]="controle"></app-icon-picker>`
})
class HoteComponent {
  controle = new FormControl('');
}

describe('IconPickerComponent', () => {
  let fixture: ComponentFixture<HoteComponent>;
  let hote: HoteComponent;
  const racine = () => fixture.nativeElement as HTMLElement;
  const bouton = () => racine().querySelector('.icon-picker__bouton') as HTMLButtonElement;
  const panneau = () => racine().querySelector('.icon-picker__panneau') as HTMLElement | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [IconPickerComponent, HoteComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HoteComponent);
    hote = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('affiche « Automatique » quand aucune icône n\'est choisie', () => {
    expect(bouton().textContent).toContain('Automatique');
  });

  it('sans icône choisie, montre l\'icône automatique déduite du libellé de la ligne', () => {
    const picker = fixture.debugElement.children[0].componentInstance as IconPickerComponent;
    picker.intitule = 'Gestion des remboursement des frais médicaux';
    picker.niveau = 0;
    fixture.detectChanges();
    expect(bouton().querySelector('i.ri-heart-pulse-line')).not.toBeNull();
    expect(bouton().textContent).toContain('Automatique');
    expect(bouton().textContent).toContain('Santé');
  });

  it('affiche l\'icône et le libellé de la valeur du formulaire', () => {
    hote.controle.setValue('ri-team-line');
    fixture.detectChanges();
    expect(bouton().querySelector('i.ri-team-line')).not.toBeNull();
    expect(bouton().textContent).toContain('Équipe');
  });

  it('affiche telle quelle une icône absente de la liste (valeur historique en base)', () => {
    hote.controle.setValue('bx bx-registered');
    fixture.detectChanges();
    expect(bouton().textContent).toContain('bx bx-registered');
  });

  it('ouvre le panneau, enregistre l\'icône choisie dans le formulaire et se referme', () => {
    bouton().click();
    fixture.detectChanges();
    expect(panneau()).not.toBeNull();

    (racine().querySelector('button[aria-label="Santé"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(hote.controle.value).toBe('ri-heart-pulse-line');
    expect(panneau()).toBeNull();
  });

  it('« Automatique » vide la valeur', () => {
    hote.controle.setValue('ri-team-line');
    fixture.detectChanges();
    bouton().click();
    fixture.detectChanges();
    (racine().querySelector('.icon-picker__auto') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(hote.controle.value).toBe('');
  });

  it('la recherche ignore accents et casse, et filtre la grille', () => {
    bouton().click();
    fixture.detectChanges();
    const total = racine().querySelectorAll('.icon-picker__choix').length;
    const champ = racine().querySelector('.icon-picker__recherche input') as HTMLInputElement;
    champ.value = 'EDITION';
    champ.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const trouvees = racine().querySelectorAll('.icon-picker__choix');
    expect(trouvees.length).toBeGreaterThan(0);
    expect(trouvees.length).toBeLessThan(total);
    expect(racine().querySelector('button[aria-label="Édition"]')).not.toBeNull();

    champ.value = 'zzzzzz';
    champ.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(racine().querySelector('.icon-picker__vide')).not.toBeNull();
  });

  it('un champ désactivé ne s\'ouvre pas', () => {
    hote.controle.disable();
    fixture.detectChanges();
    expect(bouton().disabled).toBeTrue();
    bouton().click();
    fixture.detectChanges();
    expect(panneau()).toBeNull();
  });

  it('reste ouvert quand on fait défiler la grille d\'icônes, mais se ferme au défilement de la page', () => {
    bouton().click();
    fixture.detectChanges();
    const grille = racine().querySelector('.icon-picker__grille') as HTMLElement;
    grille.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(panneau()).not.toBeNull();

    document.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(panneau()).toBeNull();
  });

  it('se ferme avec Échap et au clic en dehors', () => {
    bouton().click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(panneau()).toBeNull();

    bouton().click();
    fixture.detectChanges();
    expect(panneau()).not.toBeNull();
    document.body.click();
    fixture.detectChanges();
    expect(panneau()).toBeNull();
  });
});
