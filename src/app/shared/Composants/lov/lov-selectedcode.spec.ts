import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LovComponent } from './lov.component';

/**
 * Quand un écran change de fiche, il pousse le nouveau code dans `selectedCode`. Un code vide ne doit pas laisser
 * à l'écran l'état de la valeur précédente (message d'erreur, valeur choisie).
 */
describe('LovComponent : code poussé par l\'écran', () => {
  let fixture: ComponentFixture<LovComponent>;
  let lov: LovComponent;

  const nationalites = [{ cod_natp: 'TUN', lib_nat: 'Tunisienne' }, { cod_natp: 'FRA', lib_nat: 'Française' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LovComponent],
      imports: [FormsModule, NgbModule],
    }).compileComponents();
    fixture = TestBed.createComponent(LovComponent);
    lov = fixture.componentInstance;
    fixture.componentRef.setInput('listData', nationalites);
    fixture.componentRef.setInput('codeField', 'cod_natp');
    fixture.componentRef.setInput('columns', [{ key: 'cod_natp', label: 'Code' }, { key: 'lib_nat', label: 'Libellé' }]);
    fixture.detectChanges();
  });

  function pousser(code: any) {
    fixture.componentRef.setInput('selectedCode', code);
    fixture.detectChanges();
  }

  it('affiche la valeur trouvée puis efface tout quand le code devient vide', () => {
    const recus: any[] = [];
    lov.selectedValue.subscribe(v => recus.push(v));
    pousser('TUN');
    expect(lov.selectedItem?.['lib_nat']).toBe('Tunisienne');
    expect(recus.length).toBe(1);

    pousser('');
    expect(lov.selectedItem).toBeNull();
    expect(lov.errorMessage).toBe('');
    expect(recus.length).toBe(1);                 // rien n'est émis : les écrans existants ne reçoivent rien de nouveau
  });

  it('efface « Valeur introuvable. » quand l\'écran passe à une fiche sans valeur', () => {
    pousser('XXX');
    expect(lov.errorMessage).toBe('Valeur introuvable.');
    pousser(null);
    expect(lov.errorMessage).toBe('');
    expect(lov.selectedItem).toBeNull();
  });

  it('efface aussi pour undefined et pour une chaîne d\'espaces', () => {
    pousser('XXX');
    pousser(undefined);
    expect(lov.errorMessage).toBe('');
    pousser('XXX');
    pousser('   ');
    expect(lov.errorMessage).toBe('');
  });

  it('un nouveau code valide remplace l\'ancien et remet l\'erreur à zéro', () => {
    pousser('XXX');
    pousser('FRA');
    expect(lov.errorMessage).toBe('');
    expect(lov.selectedItem?.['lib_nat']).toBe('Française');
  });
});
