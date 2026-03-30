import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionAdhesionMutuelleComponent } from './edition-adhesion-mutuelle.component';

describe('EditionAdhesionMutuelleComponent', () => {
  let component: EditionAdhesionMutuelleComponent;
  let fixture: ComponentFixture<EditionAdhesionMutuelleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionAdhesionMutuelleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionAdhesionMutuelleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
