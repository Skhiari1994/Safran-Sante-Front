import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionEtatPrimeMoisComponent } from './edition-etat-prime-mois.component';

describe('EditionEtatPrimeMoisComponent', () => {
  let component: EditionEtatPrimeMoisComponent;
  let fixture: ComponentFixture<EditionEtatPrimeMoisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionEtatPrimeMoisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionEtatPrimeMoisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
