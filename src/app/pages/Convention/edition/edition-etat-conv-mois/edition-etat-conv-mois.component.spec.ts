import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionEtatConvMoisComponent } from './edition-etat-conv-mois.component';

describe('EditionEtatConvMoisComponent', () => {
  let component: EditionEtatConvMoisComponent;
  let fixture: ComponentFixture<EditionEtatConvMoisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionEtatConvMoisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionEtatConvMoisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
