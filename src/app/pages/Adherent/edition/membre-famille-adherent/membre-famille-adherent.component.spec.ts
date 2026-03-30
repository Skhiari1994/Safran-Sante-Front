import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembreFamilleAdherentComponent } from './membre-famille-adherent.component';

describe('MembreFamilleAdherentComponent', () => {
  let component: MembreFamilleAdherentComponent;
  let fixture: ComponentFixture<MembreFamilleAdherentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MembreFamilleAdherentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MembreFamilleAdherentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
