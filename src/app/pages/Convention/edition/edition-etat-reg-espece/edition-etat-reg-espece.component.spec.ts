import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionEtatRegEspeceComponent } from './edition-etat-reg-espece.component';

describe('EditionEtatRegEspeceComponent', () => {
  let component: EditionEtatRegEspeceComponent;
  let fixture: ComponentFixture<EditionEtatRegEspeceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionEtatRegEspeceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionEtatRegEspeceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
