import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionFichePretMoisComponent } from './edition-fiche-pret-mois.component';

describe('EditionFichePretMoisComponent', () => {
  let component: EditionFichePretMoisComponent;
  let fixture: ComponentFixture<EditionFichePretMoisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionFichePretMoisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionFichePretMoisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
