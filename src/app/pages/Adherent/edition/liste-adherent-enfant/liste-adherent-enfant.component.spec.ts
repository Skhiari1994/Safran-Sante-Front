import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeAdherentEnfantComponent } from './liste-adherent-enfant.component';

describe('ListeAdherentEnfantComponent', () => {
  let component: ListeAdherentEnfantComponent;
  let fixture: ComponentFixture<ListeAdherentEnfantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListeAdherentEnfantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListeAdherentEnfantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
