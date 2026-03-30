import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionEtatRetenuPretComponent } from './edition-etat-retenu-pret.component';

describe('EditionEtatRetenuPretComponent', () => {
  let component: EditionEtatRetenuPretComponent;
  let fixture: ComponentFixture<EditionEtatRetenuPretComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionEtatRetenuPretComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionEtatRetenuPretComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
