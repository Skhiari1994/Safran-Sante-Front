import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatPretComponent } from './etat-pret.component';

describe('EtatPretComponent', () => {
  let component: EtatPretComponent;
  let fixture: ComponentFixture<EtatPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EtatPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EtatPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
