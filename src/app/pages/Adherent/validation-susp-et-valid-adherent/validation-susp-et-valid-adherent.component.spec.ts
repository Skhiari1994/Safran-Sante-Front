import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationSuspEtValidAdherentComponent } from './validation-susp-et-valid-adherent.component';

describe('ValidationSuspEtValidAdherentComponent', () => {
  let component: ValidationSuspEtValidAdherentComponent;
  let fixture: ComponentFixture<ValidationSuspEtValidAdherentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValidationSuspEtValidAdherentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidationSuspEtValidAdherentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
