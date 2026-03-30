import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionEtatCotisationComponent } from './edition-etat-cotisation.component';

describe('EditionEtatCotisationComponent', () => {
  let component: EditionEtatCotisationComponent;
  let fixture: ComponentFixture<EditionEtatCotisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionEtatCotisationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionEtatCotisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
