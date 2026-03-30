import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionUtlisateurComponent } from './gestion-utlisateur.component';

describe('GestionUtlisateurComponent', () => {
  let component: GestionUtlisateurComponent;
  let fixture: ComponentFixture<GestionUtlisateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionUtlisateurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionUtlisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
