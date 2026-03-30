import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionIndemniteAdherentComponent } from './edition-indemnite-adherent.component';

describe('EditionIndemniteAdherentComponent', () => {
  let component: EditionIndemniteAdherentComponent;
  let fixture: ComponentFixture<EditionIndemniteAdherentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditionIndemniteAdherentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditionIndemniteAdherentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
